import { Worker } from 'bullmq';
import { JobData } from '../lib/types';
import redis from './db';
import { processInBackground } from '../controllers/controllers';

const worker = new Worker<JobData>(
    'request-queue',
    async (job) => {
        const partition = `${job.data.jobId}:${job.data.index}`;
        console.log(`Processing job ${partition}`);

        const { timestamp } = job.data;
        const data = JSON.parse((await redis.get(`job:${partition}`)) || '[]');

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
    { connection: redis, concurrency: 3 },
);

worker.on('completed', async (job, result) => {
    if (job) {
        const jobId = job.data.jobId;
        console.log(`Job ${jobId}:${job.data.index} completed`);
        await redis.hset(`job:${jobId}:result`, result);
    }
});

worker.on('failed', (job) => {
    if (job) {
        const partition = `${job.data.jobId}:${job.data.index}`;
        console.error(`Job ${partition} failed with error ${job.failedReason}`);
    }
});
