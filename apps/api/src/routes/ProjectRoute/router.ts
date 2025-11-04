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
          e."eventIdentityId" AS from_id,
          LEAD(e."eventIdentityId") OVER (
            PARTITION BY e."sessionId"
            ORDER BY e."createdAt"
          ) AS to_id
        FROM "Event" e
        WHERE e."eventIdentityId" IS NOT NULL
          AND e."projectId" = $1
      )
      SELECT
        json_build_object('id', ei_from.id, 'key', ei_from."key") AS "from",
        json_build_object('id', ei_to.id, 'key', ei_to."key") AS "to",
        COUNT(*) AS count
      FROM ordered
      JOIN "EventIdentity" ei_from ON ei_from.id = from_id
      JOIN "EventIdentity" ei_to ON ei_to.id = to_id
      WHERE to_id IS NOT NULL
      GROUP BY ei_from.id, ei_from."key", ei_to.id, ei_to."key"
      ORDER BY count DESC;
    `;

      // Execute the query safely
      const results = (await prisma.$queryRawUnsafe(sql, projectId)) as Array<{
        from: { id: string; key: string };
        to: { id: string; key: string };
        count: bigint;
      }>;

      // Convert BigInt to string for JSON serialization
      const serializedResults = results.map((row) => ({
        ...row,
        count: row.count.toString(),
      }));

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
