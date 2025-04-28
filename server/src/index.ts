import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Input } from './lib/types';
import { requestQueue, callbackQueue} from './config/mq';
import redis from './config/db';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({extended: true }));

const redisSub = redis.duplicate();
  
redisSub.psubscribe('job:*');

redisSub.on('pmessage', (_, channel, message) => {
    if (message === 'completed'){
        const jobId = channel.split('job:')[1];
        console.log(`Job ${jobId} completed`);
        callbackQueue.add('callback', {}, {jobId, attempts:3, backoff: {type: 'fixed', delay: 500}})
    }
});

app.post('/api/jobs', async(req: Request<{},{}, Input>, res: Response) => {
    const { jobId } = req.body;

    try {
        const jobMetadata = await retrieveJobMetadata(jobId);
        const totalPartitions = Number(jobMetadata.total);
        await Promise.all(
            Array.from({length: totalPartitions}).map(async (_, index) => {
                await requestQueue.add('request', {jobId,index, total: totalPartitions, timestamp: jobMetadata.timestamp} , { jobId: `${jobId}:${index}` });
            })
        );

        console.log(`Job ${jobId} accepted`);

        res.status(200).json({status: 'success', message: `Job ${jobId} accepted`});
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error', message: `Failed to accept job ${jobId}` });
    }
});

async function retrieveJobMetadata(jobId: string) {
    const metadataJson = await redis.get(`job:${jobId}:metadata`);

    if (!metadataJson) {
        throw new Error(`Job metadata not found for job ${jobId}`);
    }

    return JSON.parse(metadataJson);
}

app.listen(process.env.PORT, () => {
  console.log(`Master is running on port ${process.env.PORT}`);
});
