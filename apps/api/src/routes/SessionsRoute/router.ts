import express from "express";
import HttpError from "../../errors/HttpError";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";

const router = express.Router();

// @route   POST /sessions
// @desc    Create a new session for a project
// @access  Private
// @body    projectId - Required project ID
// TODO: Implement validation to prevent users from creating sessions for projects they do not own, while still allowing public tracking of sessions.
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId, id } = req.body;

    if (!projectId) throw new HttpError(400, "Project ID is required");

    // Verify the user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    if (!project)
      throw new HttpError(404, "Project not found or access denied");

    // Create a new session
    const session = await prisma.session.create({
      data: {
        id,
        projectId: projectId,
      },
    });

    res.status(201).json(session);
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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: userId,
      },
    });

    if (!project) {
      throw new HttpError(404, "Project not found or access denied");
    }

    // Get all sessions for this project
    const sessions = await prisma.session.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(sessions);
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
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        project: {
          customerId: userId,
        },
      },
      include: {
        events: {
          include: {
            eventIdentity: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session)
      throw new HttpError(404, "Session not found or access denied");

    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
