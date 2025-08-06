import "dotenv/config";
import express, { Request, Response } from "express";
import { Input } from "./lib/types";
import "./config/mq";
import redis from "./config/db";
import { FlowProducer } from "bullmq";

const app = express();

app.use(express.json());

const flowProducer = new FlowProducer({ connection: redis });

app.post("/api/jobs", async (req: Request<{}, {}, Input>, res: Response) => {
  const { jobId } = req.body;

  try {
    const jobMetadata = await retrieveJobMetadata(jobId);
    const totalPartitions = Number(jobMetadata.total);
    await flowProducer.add({
      name: "callback",
      queueName: "callback-queue",
      data: {
        jobId,
      },
      opts: {
        attempts: 3,
        removeOnComplete: true,
      },
      children: Array.from({ length: totalPartitions }).map((_, index) => ({
        name: "request-chunk",
        queueName: "request-queue",
        data: {
          jobId,
          index,
          timestamp: jobMetadata.timestamp,
        },
        opts: {
          attempts: 2,
          removeOnComplete: true,
        },
      })),
    });

    console.log(`Job ${jobId} accepted`);

    res
      .status(200)
      .json({ status: "success", message: `Job ${jobId} accepted` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: `Failed to accept job ${jobId}` });
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
