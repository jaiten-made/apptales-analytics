import { Event } from "@apptales/events-schema";
import { EventCategory } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import HttpError from "../../errors/HttpError";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { validateEventPayload } from "../../middleware/validation/validateEvent";
import { checkSessionExpiry } from "./middleware";

const router = express.Router();

// @route  GET /events
// @desc   Get events for a specific project owned by the authenticated user
// @access Private
// @query  projectId - Required project ID to fetch events for
router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.query;
    const userId = req.user!.id;

    if (!projectId || typeof projectId !== "string")
      throw new HttpError(400, "Project ID is required");

    // Verify the user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: userId,
      },
    });

    if (!project)
      throw new HttpError(404, "Project not found or access denied");

    // Get all events for sessions belonging to this project
    const events = await prisma.event.findMany({
      where: {
        session: {
          projectId: projectId,
        },
      },
      include: {
        eventIdentity: true,
        session: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
});

// POST /events to save events (validated by Zod)
// Note: This endpoint is typically called by the tracking script, not authenticated users
// It validates the projectId exists but doesn't require user authentication
router.post(
  "/",
  checkSessionExpiry,
  validateEventPayload,
  async (req: Request<{}, {}, Event>, res: Response, next: NextFunction) => {
    try {
      // Verify the session exists before creating the event
      const session = await prisma.session.findUnique({
        where: { id: req.body.sessionId },
        include: { project: true },
      });

      if (!session) throw new HttpError(404, "Session not found");

      // Create or get EventIdentity based on event type and properties
      const eventKey =
        req.body.type === "page_view"
          ? `${req.body.type}:${
              (req.body.properties as { location: { pathname: string } })
                .location.pathname
            }`
          : req.body.type;

      // Determine category based on event type
      const category: EventCategory =
        req.body.type === "page_view"
          ? EventCategory.PAGE_VIEW
          : EventCategory.CLICK;

      let eventIdentity = await prisma.eventIdentity.findFirst({
        where: { key: eventKey },
      });

      if (!eventIdentity) {
        eventIdentity = await prisma.eventIdentity.create({
          data: { key: eventKey, category },
        });
      }

      // Save to Prisma DB
      const event = await prisma.event.create({
        data: {
          type: req.body.type,
          properties: (req.body.properties ?? {}) as any,
          sessionId: req.body.sessionId,
          eventIdentityId: eventIdentity.id,
        },
      });

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
