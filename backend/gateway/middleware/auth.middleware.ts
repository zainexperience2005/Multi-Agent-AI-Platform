import redisClient from "../../shared/redis/redis.ts";
import type { NextFunction, Request, RequestHandler, Response } from "express";

// Extend Express Request declaration to support typing of the custom 'user' property populated by middleware
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
      firebaseUid: string;
      name: string;
      email: string;
      avatar?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  }
}

/**
 * Authentication Middleware: 'protect'
 * Intercepts incoming client requests, extracts the 'session' cookie, checks validity against Redis store,
 * and sets the request's user details. If missing or expired, halts flow and returns 401 Unauthorized.
 */
const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extract session identifier from HTTP cookies
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Fetch serialized user details matching sessionId from Redis cache
    const session = await redisClient.get(`session:${sessionId}`);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3. Deserialize user object and append it to request details for subsequent controllers
    req.user = JSON.parse(session);
    next();
  } catch (error) {
    console.log("Error in auth middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default protect;
