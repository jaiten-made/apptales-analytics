import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/verify", async (req, res, next) => {
  try {
    const token = req.cookies?.session;
    jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };
    res.status(200).json({ message: "Session valid" });
  } catch (error) {
    next(error);
  }
});

export default router;
