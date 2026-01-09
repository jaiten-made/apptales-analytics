import { Event } from "@apptales/events-schema";
import { EventCategory } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import HttpError from "../../errors/HttpError";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { validateEventPayload } from "../../middleware/validation/validateEvent";
import { updateTransitionsForSession } from "../../services/transition";
import { checkSessionExpiry } from "./middleware";

const router = express.Router();

// PII detection utilities
function containsPII(text: string): boolean {
  const patterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function sanitizeProperties(properties: any): {
  sanitized: any;
  hasPII: boolean;
} {
  if (!properties || typeof properties !== "object") {
    return { sanitized: properties, hasPII: false };
  }

  let hasPII = false;
  const sanitized = JSON.parse(JSON.stringify(properties));

  function recursiveSanitize(obj: any): void {
    if (!obj || typeof obj !== "object") return;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === "string") {
          if (containsPII(value)) {
            hasPII = true;
            obj[key] = "[REDACTED]";
          }
        } else if (typeof value === "object" && value !== null) {
          recursiveSanitize(value);
        }
      }
    }
  }

  recursiveSanitize(sanitized);
  return { sanitized, hasPII };
}

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

      // Sanitize properties and check for PII
      const { sanitized: sanitizedProperties, hasPII } = sanitizeProperties(
        req.body.properties
      );

      if (hasPII) {
        console.warn(
          `[Events] PII detected in event properties for session ${req.body.sessionId}. Properties sanitized.`
        );
      }

      // Create or get EventIdentity based on event type and properties
      const eventKey =
        req.body.type === "page_view"
          ? `${req.body.type}:${
              (sanitizedProperties as { location: { pathname: string } })
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

      // Save to Prisma DB with sanitized properties
      const event = await prisma.event.create({
        data: {
          type: req.body.type,
          properties: (sanitizedProperties ?? {}) as any,
          sessionId: req.body.sessionId,
          eventIdentityId: eventIdentity.id,
        },
      });

      // Update transitions incrementally for this session
      try {
        await updateTransitionsForSession(req.body.sessionId);
      } catch (error) {
        // Log but don't fail the event creation if transition update fails
        console.error(
          `[Events] Failed to update transitions for session ${req.body.sessionId}:`,
          error
        );
      }

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
