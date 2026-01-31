import { and, eq } from "drizzle-orm";
import { NextFunction, Response } from "express";
import { db } from "../db/index";
import { project, session } from "../db/schema";
import HttpError from "../errors/HttpError";
import { AuthRequest } from "./auth";

export const requireSessionOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
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
    const sessions = await db
      .select()
      .from(session)
      .innerJoin(project, eq(session.projectId, project.id))
      .where(and(eq(session.id, sessionId), eq(project.customerId, userId)))
      .limit(1);

    if (sessions.length === 0) {
      throw new HttpError(404, "Session not found or access denied");
    }

    next();
  } catch (error) {
    next(error);
  }
};
