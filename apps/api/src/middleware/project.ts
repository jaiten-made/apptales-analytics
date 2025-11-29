import { NextFunction, Response } from "express";
import HttpError from "../errors/HttpError";
import { prisma } from "../lib/prisma/client";
import { AuthRequest } from "./auth";

export const requireProjectOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    if (!userId) 
      throw new HttpError(401, "User not authenticated");

    if (!projectId) 
      throw new HttpError(400, "Project ID is required");
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: userId,
      },
    });
    if (!project) throw new HttpError(404, "Project not found");
    next();
  } catch (error) {
    next(error);
  }
};
