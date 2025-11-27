import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// @route   GET /auth/session/verify
// @desc    Verify user session
// @access  Public
router.get("/verify", async (req, res, next) => {
  try {
    const token = req.cookies?.session;
    if (!token)
      return res.status(401).json({ message: "No session token provided" });
    jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };
    res.status(200).json({ message: "Session valid" });
  } catch (error) {
    next(error);
  }
});

export default router;
