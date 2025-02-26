import { Queue } from 'bullmq';
import redis from './db';

const requestQueue = new Queue('request-queue', {connection:redis});

export { requestQueue };
