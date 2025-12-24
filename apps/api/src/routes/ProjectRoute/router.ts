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

// @route  GET /projects/:projectId/event-identities
// @desc   Get unique event identities for a project (for filtering)
// @access  Private
router.get(
  "/event-identities",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;

    try {
      const eventIdentities = await prisma.eventIdentity.findMany({
        where: {
          events: {
            some: {
              session: {
                projectId,
              },
            },
          },
        },
        select: {
          id: true,
          key: true,
          _count: {
            select: {
              events: true,
            },
          },
        },
        orderBy: {
          events: {
            _count: "desc",
          },
        },
      });

      // Parse event keys into type and name
      const formattedIdentities = eventIdentities.map((identity) => {
        const [type, name] = identity.key.split(":");
        return {
          id: identity.id,
          key: identity.key,
          type,
          name,
          eventCount: identity._count.events,
        };
      });

      return res.status(200).json(formattedIdentities);
    } catch (error) {
      next(error);
    }
  }
);

// @route  GET /projects/:projectId/path-exploration
// @desc   Get path exploration data for a project
// @query  startingEventKey (optional) - Filter paths that start with this event
router.get(
  "/path-exploration",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;
    const { startingEventKey } = req.query;

    try {
      // Validate starting event key format if provided
      if (startingEventKey && typeof startingEventKey !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid startingEventKey parameter" });
      }

      // Path exploration query using EventIdentity transitions
      const sql = `
      WITH ordered AS (
        SELECT
          e."sessionId",
          e."eventIdentityId",
          ei."key" as event_key,
          ROW_NUMBER() OVER (
            PARTITION BY e."sessionId"
            ORDER BY e."createdAt"
          ) AS step
        FROM "Event" e
        JOIN "Session" s ON s.id = e."sessionId"
        JOIN "EventIdentity" ei ON ei.id = e."eventIdentityId"
        WHERE e."eventIdentityId" IS NOT NULL
          AND s."projectId" = $1
          ${
            startingEventKey
              ? `AND EXISTS (
            SELECT 1 FROM "Event" e_first
            JOIN "EventIdentity" ei_first ON ei_first.id = e_first."eventIdentityId"
            WHERE e_first."sessionId" = e."sessionId"
              AND ei_first."key" = $2
            ORDER BY e_first."createdAt"
            LIMIT 1
          )`
              : ""
          }
      ),
      ${
        startingEventKey
          ? `
      first_occurrence AS (
        SELECT 
          o."sessionId",
          MIN(o.step) as first_step
        FROM ordered o
        WHERE o.event_key = $2
        GROUP BY o."sessionId"
      ),
      filtered_ordered AS (
        SELECT 
          o."sessionId",
          o."eventIdentityId",
          o.event_key,
          ROW_NUMBER() OVER (
            PARTITION BY o."sessionId"
            ORDER BY o.step
          ) AS step
        FROM ordered o
        JOIN first_occurrence fo ON fo."sessionId" = o."sessionId"
        WHERE o.step >= fo.first_step
      ),
      `
          : ""
      }
      max_steps AS (
        SELECT
          "sessionId",
          MAX(step) AS max_step
        FROM ${startingEventKey ? "filtered_ordered" : "ordered"}
        GROUP BY "sessionId"
      ),
      event_counts AS (
        SELECT
          o.step,
          ${startingEventKey ? "o.event_key" : 'ei."key"'} AS event_key,
          COUNT(*) AS count
        FROM ${startingEventKey ? "filtered_ordered" : "ordered"} o
        ${!startingEventKey ? 'JOIN "EventIdentity" ei ON ei.id = o."eventIdentityId"' : ""}
        GROUP BY o.step, ${startingEventKey ? "o.event_key" : 'ei."key"'}
      ),
      exit_counts AS (
        SELECT
          o.step,
          ${startingEventKey ? "o.event_key" : 'ei."key"'} AS event_key,
          COUNT(*) AS exits
        FROM ${startingEventKey ? "filtered_ordered" : "ordered"} o
        ${!startingEventKey ? 'JOIN "EventIdentity" ei ON ei.id = o."eventIdentityId"' : ""}
        JOIN max_steps ms ON ms."sessionId" = o."sessionId" AND ms.max_step = o.step
        GROUP BY o.step, ${startingEventKey ? "o.event_key" : 'ei."key"'}
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

      // Execute the query safely with parameters
      const results = (await prisma.$queryRawUnsafe(
        sql,
        projectId,
        ...(startingEventKey ? [startingEventKey] : [])
      )) as Array<{
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
