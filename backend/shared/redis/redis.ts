import { Redis } from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

export default redisClient;
