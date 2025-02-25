import { Queue } from 'bullmq';

const requestQueue = new Queue('request-queue');

export { requestQueue };
