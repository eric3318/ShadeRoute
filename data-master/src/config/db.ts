import IORedis from 'ioredis';

const REDIS_URL = process.env.NODE_ENV === "development" ? "redis://redis:6379" : process.env.REDIS_URL;

const redis = new IORedis(REDIS_URL,  { maxRetriesPerRequest: null });

export default redis;
