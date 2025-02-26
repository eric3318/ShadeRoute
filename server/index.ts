import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Input, Data } from './lib/types';
import { requestQueue } from './config/mq';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const PARTITION_SIZE = 10;

function splitWorkload(data: Data) {
    const partitions : Data[] = [];
    for (let i = 0; i < data.length; i += PARTITION_SIZE) {
        partitions.push(data.slice(i, i + PARTITION_SIZE));
    }
    return partitions;
}

app.post('/', async(req: Request<{},{}, Input>, res: Response) => {
    const jobId = uuidv4();
    const { data, timestamp } = req.body;
    const partitions = splitWorkload(data);
    for (let i = 0; i < partitions.length; i++) {
        await requestQueue.add('request', { timestamp, data: partitions[i] }, { jobId: `${jobId}-result_${i}` });
    }
    res.status(200).json({ message: 'Processing started', jobId });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
