import { Redis } from "ioredis";

// Instantiate the ioredis client connected to the Redis cluster/server URL.
// Set 'maxRetriesPerRequest: null' to ensure compatibility with task runner queue systems like BullMQ.
const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Event listener triggered when connection to Redis is successfully established.
redisClient.on("connect", () => {
  console.log("Redis connected");
});

export default redisClient;
