import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Input, Data } from './lib/types';
import { requestQueue } from './config/mq';
import { v4 as uuidv4 } from 'uuid';
import redis from './config/db';
import cors from 'cors';
import io from './config/socket';
const app = express();

app.use(cors({
    origin: '*',
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

redis.subscribe('job:*', (err, count) => {
    if (err) console.error(err);
});

redis.on('message', (channel, message) => {
    const jobId = channel.split('job:')[1];
    io.to(jobId).emit('job:completed', jobId);
});

const PARTITION_SIZE = 10;

function splitWorkload(data: Data) {
    const partitions : Data[] = [];
    for (let i = 0; i < data.length; i += PARTITION_SIZE) {
        partitions.push(data.slice(i, i + PARTITION_SIZE));
    }
    return partitions;
}

app.post('/', async(req: Request<{},{}, Input>, res: Response) => {
    const baseJobId = uuidv4();
    const { data, timestamp } = req.body;
    const partitions = splitWorkload(data);
    for (let i = 0; i < partitions.length; i++) {
        await requestQueue.add('request', { timestamp, data: partitions[i] }, { jobId: `${baseJobId}-result_${i}` });
    }
    await redis.set(`job:${baseJobId}:total`, partitions.length);
    res.status(200).json({ message: 'Processing started', jobId: baseJobId });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
