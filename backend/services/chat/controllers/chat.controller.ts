import Conversation from "../models/conversation.model.ts";
import Message from "../models/message.model.ts";
import type { Request, Response, NextFunction } from "express";

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers["x-user-id"];

  if (typeof userId !== "string") {
    res.status(400).json({ error: "Invalid or missing User ID header" });
    return;
  }

  try {
    const conversation = await Conversation.create({ userId });
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers["x-user-id"];

  if (typeof userId !== "string") {
    res.status(400).json({ error: "Invalid or missing User ID header" });
    return;
  }

  try {
    const conversations = await Conversation.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const updateConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId } = req.params;
  const { title } = req.body;
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { title },
      { new: true },
    );
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId } = req.params;
  try {
    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
