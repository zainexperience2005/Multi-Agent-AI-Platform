import Conversation from "../models/conversation.model.ts";
import Message from "../models/message.model.ts";
import type { Request, Response, NextFunction } from "express";

/**
 * Creates a new Conversation instance for the user.
 * 
 * @route POST /
 * @param {Request} req - Express request, expects 'x-user-id' in headers
 * @param {Response} res - Express response returning the created conversation
 * @param {NextFunction} next - Express next function for error handling
 */
export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userIdRaw = req.headers["x-user-id"];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  // Validate the user identity is present
  if (typeof userId !== "string") {
    res.status(400).json({ error: "Invalid or missing User ID header" });
    return;
  }

  try {
    // Create new Conversation mapping the conversation owner
    const conversation = await Conversation.create({ userId });
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all conversations owned by the authenticated user, sorted by creation date descending.
 * 
 * @route GET /
 * @param {Request} req - Express request, expects 'x-user-id' in headers
 * @param {Response} res - Express response returning user's conversations list
 * @param {NextFunction} next - Express next function for error handling
 */
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userIdRaw = req.headers["x-user-id"];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  // Validate the user identity is present
  if (typeof userId !== "string") {
    res.status(400).json({ error: "Invalid or missing User ID header" });
    return;
  }

  try {
    // Retrieve conversations matching user ID and sort by newest first
    const conversations = await Conversation.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the title of an existing conversation.
 * 
 * @route PUT /:conversationId
 * @param {Request} req - Express request containing updated 'title' in body and 'conversationId' parameter
 * @param {Response} res - Express response returning the updated conversation
 * @param {NextFunction} next - Express next function for error handling
 */
export const updateConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId } = req.params;
  const { title } = req.body;
  try {
    // Find and update the conversation by id, returning the newly modified document
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

/**
 * Saves a message (user prompt or agent response) to MongoDB.
 * If this is the user's first message, updates the conversation title to match the prompt context.
 * 
 * @route POST /messages
 * @param {Request} req - Express request containing message properties in body
 * @param {Response} res - Express response returning the saved message document
 * @param {NextFunction} next - Express next function for error handling
 */
export const saveMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId, role, content, images, artifacts, agent } = req.body;
  try {
    // Save the message document in the messages collection
    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts,
      agent,
    });

    // Automatically set conversation title on user's first interaction
    if (role === "user") {
      const conversation = await Conversation.findById(conversationId);
      if (
        conversation &&
        (!conversation.title || conversation.title.toLowerCase() === "new chat")
      ) {
        conversation.title = content;
        await conversation.save();
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Retrieves all messages for a specific conversation ID, sorted chronologically.
 * 
 * @route GET /messages/:conversationId
 * @param {Request} req - Express request containing 'conversationId' parameter
 * @param {Response} res - Express response returning messages list
 * @param {NextFunction} next - Express next function for error handling
 */
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId } = req.params;
  try {
    // Fetch and sort messages in ascending chronological order
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Deletes a conversation and all cascading messages associated with it.
 * 
 * @route DELETE /:conversationId
 * @param {Request} req - Express request containing 'conversationId' parameter
 * @param {Response} res - Express response returning success status
 * @param {NextFunction} next - Express next function for error handling
 */
export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversationId } = req.params;
  try {
    // Delete the conversation document itself
    await Conversation.findByIdAndDelete(conversationId);
    // Cascade delete all message documents matching conversationId
    await Message.deleteMany({ conversationId });
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
