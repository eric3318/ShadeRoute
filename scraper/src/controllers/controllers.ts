import { Request, Response } from 'express';
import { chromium } from 'playwright';
import path from 'path';
import { Input, Output } from '../lib/types';

export const getData = async (req: Request<{}, {}, Input>, res: Response) => {
    const { timeStamp, data } = req.body;

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
        ],
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });

    await context.close();
    await browser.close();
};
