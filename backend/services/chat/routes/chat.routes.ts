import express from "express";
import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation,
} from "../controllers/chat.controller.ts";

const router = express.Router();

router.post("/", createConversation);
router.get("/", getConversations);
router.put("/:conversationId", updateConversation);
router.delete("/:conversationId", deleteConversation);

export default router;
