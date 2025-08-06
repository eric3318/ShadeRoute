import { Queue, Worker, Job } from "bullmq";
import redis from "./db";

const CALLBACK_URL =
  process.env.NODE_ENV === "development"
    ? "http://routing-service:8080/api/cb"
    : process.env.CALLBACK_URL;

const requestQueue = new Queue("request-queue", { connection: redis });

const callbackQueue = new Queue("callback-queue", { connection: redis });

const callbackWorker = new Worker("callback-queue", callbackHandler, {
  connection: redis,
  concurrency: 50,
});

async function callbackHandler(job: Job) {
  const jobId = job.data.jobId;

  const res = await fetch(`${CALLBACK_URL}?jobId=${jobId}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Job ${jobId} callback failed with status ${res.status}`);
  }

  console.log(`Job ${jobId} completed`);
}

export { requestQueue, callbackQueue };
