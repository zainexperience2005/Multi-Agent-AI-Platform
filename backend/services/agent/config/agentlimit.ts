import redisClient from "../../../shared/redis/redis.ts";

const limits = {
  chat: 20,
  coding: 20,
  pdfRag: 20,
  vision: 20,
  imageAnalyzer: 20,
  pdf: 20,
  ppt: 20,
  search: 20,
} as const;

export const checkAgentLimit = async (agent: string) => {
  const max = limits[agent as keyof typeof limits];
  if (max === undefined) {
    return true;
  }
  const key = `agent:${agent}`;
  const count = await redisClient.incr(key);
  if (count == 1) {
    await redisClient.expire(key, 60 * 60 * 24 * 30);
  }
  const ttl = await redisClient.ttl(key);
  if (count > max) {
    const mins = Math.floor(ttl / 60);
    const seconds = ttl % 60;
    let message = `Agent limit exceeded for ${agent}.`;
    if (mins > 0) {
      message = `Agent limit exceeded for ${agent}. Please try again in ${mins} ${mins === 1 ? "minute" : "minutes"}.`;
    } else if (seconds > 0) {
      message = `Agent limit exceeded for ${agent}. Please try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`;
    }
    const error = new Error(message) as any;
    error.status = 429;
    throw error;
  }
  return true;
};
