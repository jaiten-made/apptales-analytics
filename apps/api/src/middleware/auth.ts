import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma/client";
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

    const customer = await prisma.customer.findUnique({
      where: { email: decoded.email },
    });

    if (!customer) {
      throw new HttpError(401, "User not found");
    }

    (req as AuthRequest).user = {
      id: customer.id,
      email: customer.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
