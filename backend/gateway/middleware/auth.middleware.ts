import redisClient from "../../shared/redis/redis.ts";
import type { NextFunction, Request, RequestHandler, Response } from "express";

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

const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const session = await redisClient.get(`session:${sessionId}`);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = JSON.parse(session);
    next();
  } catch (error) {
    console.log("Error in auth middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default protect;
