import express from 'express';
import 'dotenv/config';
import { Browser, chromium } from 'playwright';
import redis from './config/db';
import { Worker } from 'bullmq';
import { processInBackground } from './controllers/controllers';
import { Input } from './lib/types';
import { Output } from './lib/types';

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

export let browser: Browser | null = null;
let worker: Worker | null = null;

app.get('/health', async (req, res) => {
    if (!browser || !worker) {
        res.status(500).json({ message: 'Not Ok' });
        return;
    }
    res.status(200).json({ message: 'Ok' });
});

async function initBrowser() {
    browser = await chromium.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
        ],
    });
}

// const luaScript = `for i = 1, #KEYS - 1 do
//                             redis.call("hset", KEYS[1], KEYS[i+1], ARGV[i])
//                         end`;

async function initWorker() {
    worker = new Worker<Input>(
        'request-queue',
        async (job) => {
            const result = await processInBackground(job.data);
            return result;
        },
        { connection: redis, concurrency: 1 },
    );

    worker.on('completed', async (jobId, result: Output) => {
        console.log(`Job ${jobId} completed`);
        // const keys = Object.keys(result);
        // const values = Object.values(result).map((valueArr) => valueArr.join(','));

        // await redis.eval(luaScript, keys.length + 1, `job:${jobId}`, ...keys, ...values);
    });

    worker.on('failed', (jobId, error) => {
        console.error(`Job ${jobId} failed with error ${error}`);
    });
}

async function init() {
    try {
        await initBrowser();
        await initWorker();
    } catch (error) {
        console.error(error);
    }
}

init();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
