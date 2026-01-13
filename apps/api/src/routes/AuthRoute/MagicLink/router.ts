import { eq } from "drizzle-orm";
import express from "express";
import jwt from "jsonwebtoken";
import open from "open";
import { z } from "zod";
import { db } from "../../../db/index";
import { customer } from "../../../db/schema";
import HttpError from "../../../errors/HttpError";
import { sendEmail } from "../../../services/email";

const router = express.Router();

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

    // Check if customer exists
    const customers = await db
      .select()
      .from(customer)
      .where(eq(customer.email, decoded.email))
      .limit(1);

    if (customers.length > 0) {
      // Update existing
      await db
        .update(customer)
        .set({ status: "ACTIVE" })
        .where(eq(customer.email, decoded.email));
    } else {
      // Create new
      await db.insert(customer).values({
        email: decoded.email,
        status: "ACTIVE",
      });
    }

    res.redirect(process.env.APP_BASE_URL!);
  } catch (error) {
    next(error);
  }
});

export default router;
