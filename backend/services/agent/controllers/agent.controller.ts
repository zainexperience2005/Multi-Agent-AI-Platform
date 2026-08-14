import axios from "axios";
import type { Request, Response } from "express";
import { graph } from "../graph/graph.ts";
import { addMessage } from "../config/memory.ts";

export const agent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const file = req.file;
    // Save user message in the database via the chat service
    if (process.env.CHAT_SERVICE) {
      await axios.post(`${process.env.CHAT_SERVICE}/messages`, {
        conversationId,
        role: "user",
        content: prompt,
      });
    }

    // Run the agent state graph
    const result = await graph.invoke({ prompt, conversationId, agent, file: file?.path });
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", result.aiResponse);
    // Save assistant message in the database via the chat service
    if (process.env.CHAT_SERVICE) {
      await axios.post(`${process.env.CHAT_SERVICE}/messages`, {
        conversationId,
        role: "assistant",
        content: result.aiResponse,
        images: result.images,
        artifacts: result.artifacts,
        agent: result.agent,
      });
    }

    return res.status(200).json({
      answer: result.aiResponse,
      images: result.images,
      agent: result.agent,
      artifacts: result.artifacts,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
