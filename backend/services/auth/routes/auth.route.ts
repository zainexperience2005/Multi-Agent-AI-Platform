import express from "express";

const router = express.Router();

import { login, logout, getMe } from "../controllers/auth.controller.ts";

// Route: POST /login - Verifies Firebase ID Token and initializes Redis session
router.post("/login", login);

// Route: POST /logout - Destroys Redis session and clears the session cookie
router.post("/logout", logout);

// Route: GET /me - Fetches current user record using the session cookie context
router.get("/me", getMe);

export default router;
