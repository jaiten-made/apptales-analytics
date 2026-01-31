import { and, asc, desc, eq } from "drizzle-orm";
import express from "express";
import { db } from "../../db/index";
import { event, project, session as sessionTable } from "../../db/schema";
import HttpError from "../../errors/HttpError";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { signSessionToken } from "../../utils/SessionJwtUtils";

const router: express.Router = express.Router();

// @route   POST /sessions
// @desc    Create a new session for a project and set HTTP-Only cookie with signed JWT
// @access  Private
// @body    projectId - Required project ID
router.post("/", async (req, res, next) => {
  try {
    const { projectId, id } = req.body;

    if (!projectId) throw new HttpError(400, "Project ID is required");

    // Verify the project exists
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (projects.length === 0)
      throw new HttpError(404, "Project not found or access denied");

    // Create a new session
    const sessions = await db
      .insert(sessionTable)
      .values({
        id,
        projectId: projectId,
      })
      .returning();

    const newSession = sessions[0];

    // Generate signed JWT token with 30-minute expiration
    const token = signSessionToken(
      {
        sessionId: newSession.id,
        projectId: newSession.projectId,
      },
      process.env.JWT_SECRET!,
    );

    // Set HTTP-Only cookie
    res.cookie("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
    });

    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
});

// @route   GET /sessions
// @desc    Get all sessions for a specific project owned by the authenticated user
// @access  Private
// @query   projectId - Required project ID to fetch sessions for
router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.query;
    const userId = req.user!.id;

    if (!projectId || typeof projectId !== "string") {
      throw new HttpError(400, "Project ID is required");
    }

    // Verify the user owns the project
    const projects = await db
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.customerId, userId)))
      .limit(1);

    if (projects.length === 0) {
      throw new HttpError(404, "Project not found or access denied");
    }

    // Get all sessions for this project
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.projectId, projectId))
      .orderBy((s) => desc(s.createdAt));

    // Count events for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (sess) => {
        const eventCounts = await db
          .select()
          .from(event)
          .where(eq(event.sessionId, sess.id));
        return {
          ...sess,
          _count: {
            events: eventCounts.length,
          },
        };
      }),
    );

    res.json(sessionsWithCounts);
  } catch (error) {
    next(error);
  }
});

// @route   GET /sessions/:sessionId
// @desc    Get a specific session with its events
// @access  Private
router.get("/:sessionId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    // Verify the user owns the project that owns this session
    const sessions = await db.query.session.findFirst({
      where: eq(sessionTable.id, sessionId),
      with: {
        events: {
          with: {
            eventIdentity: true,
          },
          orderBy: [asc(event.createdAt)],
        },
        project: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sessions)
      throw new HttpError(404, "Session not found or access denied");

    // Verify ownership
    const projectData = await db
      .select()
      .from(project)
      .where(
        and(eq(project.id, sessions.projectId), eq(project.customerId, userId)),
      )
      .limit(1);

    if (projectData.length === 0)
      throw new HttpError(404, "Session not found or access denied");

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

export default router;
