import { generateCuid } from "@apptales/utils";
import express from "express";
import jwt from "jsonwebtoken";
import open from "open";
import { z } from "zod";
import { db } from "../../../db/index";
import { customer } from "../../../db/schema";
import HttpError from "../../../errors/HttpError";
import { sendEmail } from "../../../services/email.service";

const router: express.Router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { email } = req.body;
    z.string().email().parse(email);
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "14d",
    });
    const origin = `${req.protocol}://${req.get("host")}`;
    const link = `${origin}/auth/magic-link/verify?token=${token}`;
    if (process.env.NODE_ENV === "development") {
      await open(link);
      return res.json({
        message: "Magic link generated (Development Mode)",
        token,
      });
    }
    await sendEmail({
      to: email,
      subject: "Magic Link",
      text: `You can log in using the following link: ${link}`,
    });
    res.json({
      message: "Magic link sent",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw new HttpError(400, "Token missing");
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new HttpError(500, "Missing JWT secret");
    const decoded = jwt.verify(token.toString(), secret) as {
      email: string;
    };
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    try {
      await db
        .insert(customer)
        .values({
          id: generateCuid(),
          email: decoded.email,
          status: "ACTIVE",
        })
        .onConflictDoNothing({ target: customer.email });
    } catch (_) {}

    res.redirect(process.env.APP_BASE_URL!);
  } catch (error) {
    next(error);
  }
});

export default router;
