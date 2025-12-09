import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../../lib/prisma/client";
import { signSessionToken, verifySessionToken } from "../../utils/session-jwt";

const createAndSetSessionCookie = async (res: Response, projectId: string) => {
  const newSession = await prisma.session.create({
    data: {
      projectId,
    },
  });

  const token = signSessionToken(
    {
      sessionId: newSession.id,
      projectId: newSession.projectId,
    },
    process.env.JWT_SECRET!
  );

  res.cookie("sessionToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 60 * 1000,
  });

  return newSession.id;
};

export const checkSessionExpiry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.sessionToken;

    if (!token) {
      const projectId = req.query.projectId as string | undefined;
      if (!projectId)
        throw new Error(
          "Project ID is required to create a session (from middleware)"
        );

      req.body.sessionId = await createAndSetSessionCookie(res, projectId);
      return next();
    }

    const decoded = jwt.decode(token) as {
      sessionId: string;
      projectId: string;
    };

    let sessionId = decoded.sessionId;

    try {
      verifySessionToken(token, process.env.JWT_SECRET!);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        sessionId = await createAndSetSessionCookie(res, decoded.projectId);
      }
    }

    req.body.sessionId = sessionId;
    next();
  } catch (error) {
    next(error);
  }
};
