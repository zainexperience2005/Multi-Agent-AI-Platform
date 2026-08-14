import redisClient from "../../../shared/redis/redis.ts";
import { getMessages } from "../utils/getMessages.ts";

export const getMemory = async (conversationId: string) => {
  try {
    const key = `messages-${conversationId}`;
    const cached = await redisClient.get(key);

    if (cached) return JSON.parse(cached);

    const messages = await getMessages(conversationId);

    await redisClient.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
    return messages;
  } catch (error) {
    console.log("Error fetching memory : ", error);
  }
};

export const addMessage = async (
  conversationId: string,
  role: string,
  content: string,
) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redisClient.get(key);
  const messages = rawMessages ? JSON.parse(rawMessages) : [];
  messages.push({ role, content });
  if (messages.length > 20) {
    messages.shift();
  }

  await redisClient.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
};
