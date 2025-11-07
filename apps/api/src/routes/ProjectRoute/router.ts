import express from "express";
import { prisma } from "../../lib/prisma/client";

const router = express.Router({
  mergeParams: true,
});

// @route  GET /projects/:id/path-exploration
// @desc   Get path exploration data for a project
router.get(
  "/path-exploration",
  async (
    req: express.Request<{ projectId: string }>,
    res: express.Response
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
        WHERE e."eventIdentityId" IS NOT NULL
          AND e."projectId" = $1
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
      let message = "";
      if (error instanceof Error) {
        message = error.message;
      }
      res.status(500).json({
        message,
      });
    }
  }
);

export default router;
