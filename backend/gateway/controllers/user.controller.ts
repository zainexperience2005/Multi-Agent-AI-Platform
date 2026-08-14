import type { Request, Response } from "express";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: "User fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export default getCurrentUser;
