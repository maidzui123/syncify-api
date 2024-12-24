import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

export { pubClient, subClient };