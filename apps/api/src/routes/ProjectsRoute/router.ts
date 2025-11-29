import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";

const router = express.Router();

router.use(requireAuth);

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// @route   POST /projects
// @desc    Create a new project
// @access  Private
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { name } = projectSchema.parse(req.body);
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        name,
        customerId: userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// @route   GET /projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const projects = await prisma.project.findMany({
      where: {
        customerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

export default router;
