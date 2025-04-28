import {Queue, Worker, Job } from 'bullmq';
import redis from './db';

const CALLBACK_URL = process.env.NODE_ENV === 'development' ? "http://localhost:8080/api/cb" :'http://routing-service/api/cb';

const requestQueue = new Queue('request-queue', {connection:redis});

const callbackQueue = new Queue('callback-queue', {connection:redis});

const callbackWorker = new Worker('callback-queue', callbackHandler, {connection:redis, concurrency: 50})

async function callbackHandler(job : Job){
    const jobId = job.id;

    const res = await fetch(`${CALLBACK_URL}?jobId=${jobId}`, {
        method: 'POST',
    });

    if (!res.ok) {
        throw new Error(`Job ${jobId} callback failed with status ${res.status}`);
    }
}

export { requestQueue, callbackQueue};
