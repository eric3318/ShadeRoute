import path from 'path';
import { Input, Output } from '../lib/types';
import { browser } from '..';
import { fileURLToPath } from 'url';
import type { BrowserContext } from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare global {
    interface Window {
        inputData: Input;
        outputData: Output;
        MAPBOX_CRED: string;
        SHADEMAP_CRED: string;
    }
}

export const processInBackground = async (input: Input) => {
    let context: BrowserContext | null = null;
    try {
        context = await browser.createBrowserContext();
        const page = await context.newPage();

        page.setViewport({ width: 1920, height: 1080 });

        page.on('console', (msg) => {
            console.log(msg.text());
        });

        const htmlPath = path.join(__dirname, '../scripts/shadow.html');

        await page.evaluateOnNewDocument(
            (input, mapbox, shademap) => {
                window.MAPBOX_CRED = mapbox;
                window.SHADEMAP_CRED = shademap;
                window.inputData = input;
            },
            input,
            process.env.MAPBOX_ACCESS_TOKEN as string,
            process.env.SHADEMAP_API_KEY as string,
        );

        await page.goto(`file://${htmlPath}`, {
            waitUntil: 'networkidle0',
        });

        await page.waitForFunction(() => window.outputData !== undefined, {
            timeout: 30000,
        });

        const result = await page.evaluate(() => window.outputData);

        return result;
    } catch (error) {
        console.error('Error in Puppeteer process:', error);
        return {};
    } finally {
        if (context) {
            await context.close();
        }
    }
};
