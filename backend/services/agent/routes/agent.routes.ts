import express from "express";
import { agent } from "../controllers/agent.controller.ts";
import { upload } from "../config/multer.ts";

const router = express.Router();

router.post("/", upload.single("file"), agent);

export default router;
