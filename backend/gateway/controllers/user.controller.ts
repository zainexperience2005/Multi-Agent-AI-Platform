import type { Request, Response } from "express";

/**
 * Retrieves the currently logged-in user's profile details.
 * This controller relies on the `protect` middleware to have verified 
 * the session and populated `req.user`.
 * 
 * @param {Request} req - Express Request object containing the populated user context
 * @param {Response} res - Express Response object returning user info or 500 error
 * @returns {Promise<Response>} HTTP Response with user record or error message
 */
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Return successfully retrieved user record stored in request context
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
