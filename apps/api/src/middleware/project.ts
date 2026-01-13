import { and, eq } from "drizzle-orm";
import { NextFunction, Response } from "express";
import { db } from "../db/index";
import { project } from "../db/schema";
import HttpError from "../errors/HttpError";
import { AuthRequest } from "./auth";

export const requireProjectOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new HttpError(401, "User not authenticated");

    if (!projectId) throw new HttpError(400, "Project ID is required");

    const projects = await db
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.customerId, userId)))
      .limit(1);

    if (projects.length === 0) throw new HttpError(404, "Project not found");
    next();
  } catch (error) {
    next(error);
  }
};
