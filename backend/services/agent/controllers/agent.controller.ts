import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import { graph } from "../graph/graph.ts";
import { addMessage } from "../config/memory.ts";
import { checkAgentLimit } from "../config/agentlimit.ts";
import fs from "fs";

export const agent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { prompt, conversationId, agent } = req.body;
    
    // Check limit before running the agent graph or messaging APIs
    await checkAgentLimit(agent);

    const file = req.file;
    // Save user message in the database via the chat service
    if (process.env.CHAT_SERVICE) {
      await axios.post(`${process.env.CHAT_SERVICE}/messages`, {
        conversationId,
        role: "user",
        content: prompt,
        file,
      });
    }

    // Run the agent state graph
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      file: file ? { path: file.path, mimetype: file.mimetype } : undefined,
    });
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
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file on error:", unlinkErr);
      }
    }
    next(error);
  }
};
