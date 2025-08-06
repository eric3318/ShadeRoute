import express from 'express';
import 'dotenv/config';
import puppeteer, { Browser } from 'puppeteer';
import './config/db';
import './config/mq';
import { Response, Request } from 'express';

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    if (String(reason).includes('Protocol error') || String(reason).includes('Target closed')) {
        process.exit(1);
    }
});

const app = express();

export let browser: Browser;

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
            '--allow-chrome-scheme-url',
        ],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
}

async function init() {
    try {
        if (process.env.NODE_ENV === 'development') {
            await initDevBrowser();
        } else {
            await initBrowser();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();

app.get('/health', async (req: Request, res: Response) => {
    if (!browser || !browser.connected) {
        res.status(500).json({ status: 'error', message: 'Not Ok' });
        return;
    }

    res.status(200).json({ status: 'success', message: 'Ok' });
});

app.listen(process.env.PORT, () => {
    console.log(`Worker is running on port ${process.env.PORT}`);
});
