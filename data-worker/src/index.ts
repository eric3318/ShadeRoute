import express from 'express';
import 'dotenv/config';
import puppeteer, { Browser } from 'puppeteer';
import redis from './config/db';
import { Worker } from 'bullmq';
import { processInBackground } from './controllers/controllers';
import { Input } from './lib/types';
import { Response, Request } from 'express';

const app = express();

export let browser: Browser;
let worker: Worker;

async function initDevBrowser() {
    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
        ],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
}

async function initBrowser() {
    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--headless=new',
            '--use-angle=vulkan',
            '--enable-features=Vulkan',
            // '--disable-vulkan-surface',
            // '--enable-unsafe-webgpu',
            // '--disable-search-engine-choice-screen',
            // '--ash-no-nudges',
            // '--no-first-run',
            // '--disable-features=Translate',
            // '--no-default-browser-check',
            // '--window-size=1920,1080',
            '--allow-chrome-scheme-url',
        ],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
}

const luaScript = `
    local currentCount = redis.call("incr", KEYS[1])
    if currentCount == tonumber(KEYS[2]) then
        redis.call("publish", KEYS[3], "completed")
    end`;

async function initWorker() {
    worker = new Worker<Input>(
        'request-queue',
        async (job) => {
            if (!job.id) {
                return;
            }
            console.log('Processing job', job.id);
            const { timestamp } = job.data;
            const data = JSON.parse((await redis.get(`job:${job.id}`)) || '[]');

            if (data.length === 0) {
                console.log('No data found');
                return;
            }

            const result = await processInBackground({
                timestamp,
                data,
            });
            return result;
        },
        { connection: redis, concurrency: 10 },
    );

    worker.on('completed', async (job, result) => {
        if (job && job.id) {
            console.log('Job completed', job.id);
            const baseJobId = job.id.split(':')[0];
            await redis.hset(`job:${baseJobId}:result`, result);
            const totalPartitions = job.data.total;
            await redis.eval(luaScript, 3, `job:${baseJobId}:completed`, Number(totalPartitions), `job:${baseJobId}`);
        }
    });

    worker.on('failed', (job) => {
        if (job) {
            console.error(`Job ${job.id} failed with error ${job.failedReason}`);
        }
    });
}

async function init() {
    try {
        if (process.env.NODE_ENV === 'development') {
            await initDevBrowser();
        } else {
            await initBrowser();
        }
        await initWorker();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();

app.get('/health', async (req: Request, res: Response) => {
    if (!browser || !worker) {
        res.status(500).json({ status: 'error', message: 'Not Ok' });
        return;
    }
    res.status(200).json({ status: 'success', message: 'Ok' });
});

app.listen(process.env.PORT, () => {
    console.log(`Worker is running on port ${process.env.PORT}`);
});
