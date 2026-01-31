import { generateCuid } from "@apptales/utils";
import { desc, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db/index";
import { event, session } from "../../db/schema";
import {
  signSessionToken,
  verifySessionToken,
} from "../../utils/SessionJwtUtils";

const { TokenExpiredError } = jwt;

const createAndSetSessionCookie = async (res: Response, projectId: string) => {
  const newSessions = await db
    .insert(session)
    .values({
      id: generateCuid(),
      projectId,
    })
    .returning();

  const newSession = newSessions[0];

  const token = signSessionToken(
    {
      sessionId: newSession.id,
      projectId: newSession.projectId,
    },
    process.env.JWT_SECRET!,
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
  next: NextFunction,
) => {
  try {
    // Uncomment for testing purposes
    // delete req.cookies.sessionToken;
    const token = req.cookies.sessionToken;
    if (!token) {
      const projectId = req.query.projectId as string | undefined;
      if (!projectId)
        throw new Error(
          "Project ID is required to create a session (from middleware)",
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

    // Look up the last event for this session
    const lastEvents = await db
      .select()
      .from(event)
      .where(eq(event.sessionId, sessionId))
      .orderBy(desc(event.createdAt))
      .limit(1);

    const lastEvent = lastEvents[0];

    // If there's a last event, check if 30 minutes have passed
    if (lastEvent) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      if (new Date(lastEvent.createdAt) < thirtyMinutesAgo) {
        // Create a new session if 30 minutes have passed since the last event
        sessionId = await createAndSetSessionCookie(res, decoded.projectId);
      }
    }
    req.body.sessionId = sessionId;
    next();
  } catch (error) {
    next(error);
  }
};
