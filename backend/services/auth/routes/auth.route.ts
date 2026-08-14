import express from "express";

const router = express.Router();

import { login, logout, getMe } from "../controllers/auth.controller.ts";

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;

