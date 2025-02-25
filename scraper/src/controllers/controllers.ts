import path from 'path';
import { Input, Output } from '../lib/types';
import { browser } from '../server';

declare global {
    interface Window {
        inputData: Input;
        outputData: Output;
    }
}

// export const getData = async (req: Request<{}, {}, Input>, res: Response) => {
//     const { timestamp, data, jobId, resultId } = req.body;

//     if (!timestamp || !data || !jobId || !resultId) {
//         res.status(400).send({ message: 'Invalid request' });
//         return;
//     }

//     res.status(202).send({ message: 'Processing started' });

//     // add more validation logic here

//     const result = (await processInBackground(req.body)) as Output;
//     if (!result) {
//         return;
//     }

//     const luaScript = `for i = 1, #KEYS - 1 do
//                             redis.call("hset", KEYS[1], KEYS[i+1], ARGV[i])
//                         end`;

//     const keys = Object.keys(result);
//     const values = Object.values(result).map((valueArr) => valueArr.join(','));

//     await redis.eval(luaScript, keys.length + 1, `job:${jobId}:result_${resultId}`, ...keys, ...values);
// };

export const processInBackground = async (input: Input) => {
    let context;
    try {
        context = await browser.newContext();
        const page = await context.newPage();

        await page.setViewportSize({ width: 1920, height: 1080 });

        await page.addInitScript(`
        window.MAPBOX_CRED = '${process.env.MAPBOX_ACCESS_TOKEN}';
        window.SHADEMAP_CRED = '${process.env.SHADEMAP_API_KEY}';
        window.inputData = ${JSON.stringify(input)};
    `);

        const htmlPath = path.join(__dirname, '../scripts/shadow.html');
        await page.goto(`file://${htmlPath}`);

        await page.waitForFunction(() => window.outputData !== undefined, {
            timeout: 60000, // 1 minute timeout
        });

        const result = await page.evaluate(() => window.outputData);

        await context.close();

        return result;
    } catch (error) {
        console.error(error);
        return {};
    } finally {
        if (context) {
            await context.close();
        }
    }
};
