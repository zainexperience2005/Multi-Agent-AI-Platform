import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.ts";
import User from "../models/user.model.ts";
import redisClient from "../../../shared/redis/redis.ts";
import type { Request, Response } from "express";

/**
 * Endpoint: POST /login
 * Verifies a Firebase ID token. Checks if the user exists in MongoDB (creating them if not).
 * Spawns a Redis-backed session and returns an HTTP-only session cookie.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // 1. Verify the client-side Firebase ID token using Firebase Admin SDK
    const decoded = await getAuth(app).verifyIdToken(token);
    
    // 2. Fetch or initialize the user document in MongoDB
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
      });
    }

    // 3. Generate a random UUID session token
    const sessionId = crypto.randomUUID();
    
    // 4. Store user details in Redis with a 7-day TTL (Time To Live)
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(user),
      "EX",
      60 * 60 * 24 * 7,
    );

    // 5. Respond with HTTP-only session cookie to protect against XSS attacks
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false, // Set to true in production if running behind SSL/HTTPS
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 * 7, // 7-day duration matching Redis EX
    });

    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Endpoint: POST /logout
 * Destroys the user session by removing the entry from Redis and clearing the client session cookie.
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { session } = req.cookies;
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Remove session key from Redis cache
    await redisClient.del(`session:${session}`);
    
    // 2. Clear client-side cookie
    res.clearCookie("session");
    
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Endpoint: GET /me
 * Verifies session validity against Redis and returns the deserialized user record.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const { session } = req.cookies;
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Pull user details string from Redis cache
    const userStr = await redisClient.get(`session:${session}`);
    if (!userStr) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Parse and return the current user profile
    const user = JSON.parse(userStr);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

