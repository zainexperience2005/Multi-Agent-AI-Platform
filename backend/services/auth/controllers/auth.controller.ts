import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.ts";
import User from "../models/user.model.ts";
import redisClient from "../../../shared/redis/redis.ts";
import type { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
      });
    }
    const sessionId = crypto.randomUUID();
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(user),
      "EX",
      60 * 60 * 24 * 7,
    );
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 * 7,
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

export const logout = async (req: Request, res: Response) => {
  try {
    const { session } = req.cookies;
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await redisClient.del(`session:${session}`);
    res.clearCookie("session");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const { session } = req.cookies;
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userStr = await redisClient.get(`session:${session}`);
    if (!userStr) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = JSON.parse(userStr);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

