import { desc, eq } from "drizzle-orm";
import express from "express";
import { z } from "zod";
import { db } from "../../db/index";
import { project } from "../../db/schema";
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

    const result = await db
      .insert(project)
      .values({
        name,
        customerId: userId,
      })
      .returning();

    res.status(201).json(result[0]);
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

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.customerId, userId))
      .orderBy(desc(project.createdAt));

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

export default router;
