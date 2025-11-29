import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { requireProjectOwnership } from "../../middleware/project";

const router = express.Router({
  mergeParams: true,
});

router.use(requireAuth);
router.use(requireProjectOwnership);

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// @route   GET /projects/:projectId
// @desc    Get a specific project
// @access  Private
router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: userId,
      },
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /projects/:projectId
// @desc    Update a project
// @access  Private
router.put("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = projectSchema.parse(req.body);

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /projects/:projectId
// @desc    Delete a project
// @access  Private
router.delete("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
});

// @route  GET /projects/:projectId/path-exploration
// @desc   Get path exploration data for a project
router.get(
  "/path-exploration",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;

    try {
      // Path exploration query using EventIdentity transitions
      const sql = `
      WITH ordered AS (
        SELECT
          e."sessionId",
          e."eventIdentityId",
          ROW_NUMBER() OVER (
            PARTITION BY e."sessionId"
            ORDER BY e."createdAt"
          ) AS step
        FROM "Event" e
        JOIN "Session" s ON s.id = e."sessionId"
        WHERE e."eventIdentityId" IS NOT NULL
          AND s."projectId" = $1
      ),
      max_steps AS (
        SELECT
          "sessionId",
          MAX(step) AS max_step
        FROM ordered
        GROUP BY "sessionId"
      ),
      event_counts AS (
        SELECT
          o.step,
          ei."key" AS event_key,
          COUNT(*) AS count
        FROM ordered o
        JOIN "EventIdentity" ei ON ei.id = o."eventIdentityId"
        GROUP BY o.step, ei."key"
      ),
      exit_counts AS (
        SELECT
          o.step,
          ei."key" AS event_key,
          COUNT(*) AS exits
        FROM ordered o
        JOIN "EventIdentity" ei ON ei.id = o."eventIdentityId"
        JOIN max_steps ms ON ms."sessionId" = o."sessionId" AND ms.max_step = o.step
        GROUP BY o.step, ei."key"
      )
      SELECT
        ec.step,
        ec.event_key,
        ec.count,
        COALESCE(ex.exits, 0) AS exits
      FROM event_counts ec
      LEFT JOIN exit_counts ex ON ex.step = ec.step AND ex.event_key = ec.event_key
      ORDER BY ec.step, ec.count DESC;
    `;

      // Execute the query safely
      const results = (await prisma.$queryRawUnsafe(sql, projectId)) as Array<{
        step: bigint;
        event_key: string;
        count: bigint;
        exits: bigint;
      }>;

      // Convert BigInt to string for JSON serialization
      const serializedResults = results.map((row) => {
        const [type, name] = row.event_key.split(":");
        const result: any = {
          step: Number(row.step),
          event: {
            key: row.event_key,
            type,
            name,
          },
          count: Number(row.count),
        };

        // Only include exits if greater than 0
        const exits = Number(row.exits);
        if (exits > 0) {
          result.exits = exits;
        }

        return result;
      });

      return res.status(200).json(serializedResults);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
