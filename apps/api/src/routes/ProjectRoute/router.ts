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
        e1.type AS from_event,
        e2.type AS to_event,
        COUNT(*) AS count
      FROM "Event" e1
      JOIN "Event" e2
        ON e1."sessionId" = e2."sessionId"
       AND e2."projectId" = e1."projectId"
       AND (
         e2."createdAt" > e1."createdAt"
         OR (e2."createdAt" = e1."createdAt" AND e2.id > e1.id)
       )
      WHERE e1."projectId" = $1
      GROUP BY from_event, to_event
      ORDER BY count DESC;
    `;

      // Execute the query safely
      const results = (await prisma.$queryRawUnsafe(sql, projectId)) as Array<{
        from_event: string;
        to_event: string;
        count: bigint;
      }>;

      // normalize count to number
      const data = results.map((r) => ({
        from_event: r.from_event,
        to_event: r.to_event,
        count: Number(r.count),
      }));

      return res.status(200).json(data);
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
