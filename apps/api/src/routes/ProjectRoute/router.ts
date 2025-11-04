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
      // Your exact query, using bound parameter for safety
      const sql = `
      SELECT
        "sessionId",
        json_agg(
          json_build_object(
            'id', e.id,
            'type', e.type,
            'createdAt', e."createdAt",
            'properties', e.properties
          ) ORDER BY e."createdAt", e.id
        ) AS events
      FROM "Event" e
      WHERE e."projectId" = $1
      GROUP BY e."sessionId"
      ORDER BY MIN(e."createdAt");
    `;

      // Execute the query safely
      const results = (await prisma.$queryRawUnsafe(sql, projectId)) as Array<{
        from_event: string;
        to_event: string;
        count: bigint;
      }>;

      return res.status(200).json(results);
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
