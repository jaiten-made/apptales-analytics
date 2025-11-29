import { NextFunction, Response } from "express";
import HttpError from "../errors/HttpError";
import { prisma } from "../lib/prisma/client";
import { AuthRequest } from "./auth";

export const requireSessionOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new HttpError(401, "User not authenticated");
    }

    if (!sessionId) {
      throw new HttpError(400, "Session ID is required");
    }

    // Verify the user owns the project that owns this session
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        project: {
          customerId: userId,
        },
      },
    });

    if (!session) {
      throw new HttpError(404, "Session not found or access denied");
    }

    next();
  } catch (error) {
    next(error);
  }
};
