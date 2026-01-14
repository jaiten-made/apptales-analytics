import { Event, EventType } from "@apptales/types";
import { and, desc, eq } from "drizzle-orm";
import express, { NextFunction, Request, Response } from "express";
import { db } from "../../db/index";
import { event, eventIdentity, project, session } from "../../db/schema";
import HttpError from "../../errors/HttpError";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { validateEventPayload } from "../../middleware/validation/validateEvent";
import { updateTransitionsForSession } from "../../services/transition";
import { sanitizeProperties } from "../../utils/EventPropertyUtils";
import { getEventCategory } from "../../utils/EventUtils";
import { checkSessionExpiry } from "./middleware";

const router: express.Router = express.Router();

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
    const projects = await db
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.customerId, userId)))
      .limit(1);

    if (projects.length === 0)
      throw new HttpError(404, "Project not found or access denied");

    // Get all events for sessions belonging to this project
    const events = await db
      .select()
      .from(event)
      .innerJoin(session, eq(event.sessionId, session.id))
      .where(eq(session.projectId, projectId))
      .orderBy(desc(event.createdAt));

    res.json(events.map((e) => e.Event));
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
      const sessionRecord = await db.query.session.findFirst({
        where: (s, { eq }) => eq(s.id, req.body.sessionId),
        with: { project: true },
      });

      if (!sessionRecord) throw new HttpError(404, "Session not found");

      // Sanitize properties and check for PII
      const sanitizedProperties = sanitizeProperties(req.body.properties);

      let eventKey: string = req.body.type;
      if (req.body.type === EventType.PAGE_VIEW) {
        if ("location" in sanitizedProperties) {
          eventKey = eventKey + `:${sanitizedProperties.location.pathname}`;
        } else {
          eventKey = eventKey + `:unknown_pathname`;
        }
      }

      if (req.body.type === EventType.CLICK) {
        if ("textContent" in sanitizedProperties) {
          eventKey = eventKey + `:${sanitizedProperties.textContent}`;
        } else {
          eventKey = eventKey + `:unknown_text_content`;
        }
      }

      // Determine category based on event type
      const category = getEventCategory(req.body.type);

      let eventIdentityRecord = await db.query.eventIdentity.findFirst({
        where: (ei, { eq }) => eq(ei.key, eventKey),
      });

      if (!eventIdentityRecord) {
        const result = await db
          .insert(eventIdentity)
          .values({ key: eventKey, category })
          .returning();
        eventIdentityRecord = result[0];
      }

      // Save to Drizzle DB with sanitized properties
      const eventResult = await db
        .insert(event)
        .values({
          type: req.body.type,
          properties: sanitizedProperties ?? {},
          sessionId: req.body.sessionId,
          eventIdentityId: eventIdentityRecord.id,
        })
        .returning();

      const createdEvent = eventResult[0];

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

      res.status(201).json(createdEvent);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
