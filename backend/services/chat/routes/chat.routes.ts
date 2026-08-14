import express from "express";
import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation,
  getMessages,
  saveMessage,
} from "../controllers/chat.controller.ts";

const router = express.Router();

// Route: POST /
// Description: Spawns a new conversation entry.
router.post("/", createConversation);

// Route: GET /
// Description: Fetches all active conversations belonging to the authenticated user.
router.get("/", getConversations);

// Route: PUT /:conversationId
// Description: Updates details (like title) of a specific conversation.
router.put("/:conversationId", updateConversation);

// Route: DELETE /:conversationId
// Description: Deletes a conversation and performs cascading message deletion.
router.delete("/:conversationId", deleteConversation);

// Route: GET /messages/:conversationId
// Description: Fetches all messages for a specific conversation.
router.get("/messages/:conversationId", getMessages);

// Route: POST /messages
// Description: Saves a new message inside a conversation.
router.post("/messages", saveMessage);

export default router;
