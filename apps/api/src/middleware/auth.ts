import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index";
import { customer } from "../db/schema";
import HttpError from "../errors/HttpError";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.session;

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    const customers = await db
      .select()
      .from(customer)
      .where(eq(customer.email, decoded.email))
      .limit(1);

    const cust = customers[0];

    if (!cust) {
      throw new HttpError(401, "User not found");
    }

    (req as AuthRequest).user = {
      id: cust.id,
      email: cust.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
