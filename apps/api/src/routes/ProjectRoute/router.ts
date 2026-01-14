import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import express from "express";
import { z } from "zod";
import { db } from "../../db/index";
import {
  event,
  eventIdentity,
  project,
  session,
  transition,
} from "../../db/schema";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { requireProjectOwnership } from "../../middleware/project";
import {
  computeTransitionsForProject,
  getTopTransitionsFromEvent,
  getTopTransitionsToEvent,
} from "../../services/transition";

const router: express.Router = express.Router({
  mergeParams: true,
});

router.use(requireAuth);
router.use(requireProjectOwnership);

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// @route   GET /projects/:projectId
// @desc    Fetch a project owned by the authenticated customer
// @access  Private
router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const projects = await db
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.customerId, userId)))
      .limit(1);

    res.json(projects[0] || null);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /projects/:projectId
// @desc    Update a project's name after validating input
// @access  Private
router.put("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = projectSchema.parse(req.body);

    const updatedProjects = await db
      .update(project)
      .set({ name })
      .where(eq(project.id, projectId))
      .returning();

    res.json(updatedProjects[0]);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /projects/:projectId
// @desc    Delete a project owned by the authenticated customer
// @access  Private
router.delete("/", async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params;

    await db.delete(project).where(eq(project.id, projectId));

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
});

// @route  GET /projects/:projectId/event-identities
// @desc   List event identities for the project with optional category/search filters and counts
// @access  Private
router.get(
  "/event-identities",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;
    const { category, limit = "50", search } = req.query;

    try {
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);

      // Step 1: Get valid eventIdentityIds that have events in sessions for this project
      const validEventIdsQuery = db
        .selectDistinct({ eventIdentityId: event.eventIdentityId })
        .from(event)
        .innerJoin(session, eq(event.sessionId, session.id))
        .where(eq(session.projectId, projectId));

      const validEventIds = await validEventIdsQuery;
      const eventIdArray = validEventIds.map((e) => e.eventIdentityId);

      if (eventIdArray.length === 0) {
        return res.status(200).json([]);
      }

      // Step 2: Build conditions for eventIdentity query
      const conditions = [inArray(eventIdentity.id, eventIdArray)];

      if (category && typeof category === "string") {
        conditions.push(
          eq(eventIdentity.category, category as "PAGE_VIEW" | "CLICK")
        );
      }

      if (search && typeof search === "string" && search.length >= 2) {
        conditions.push(ilike(eventIdentity.key, `%${search}%`));
      }

      // Step 3: Get eventIdentities
      const eventIdentities = await db
        .select({
          id: eventIdentity.id,
          key: eventIdentity.key,
          category: eventIdentity.category,
        })
        .from(eventIdentity)
        .where(and(...conditions))
        .limit(limitNum);

      // Step 4: Get event counts for these identities
      const eventCounts = await db
        .select({
          eventIdentityId: event.eventIdentityId,
          count: sql<number>`count(*)::int`.as("count"),
        })
        .from(event)
        .innerJoin(session, eq(event.sessionId, session.id))
        .where(
          and(
            inArray(
              event.eventIdentityId,
              eventIdentities.map((e) => e.id)
            ),
            eq(session.projectId, projectId)
          )
        )
        .groupBy(event.eventIdentityId);

      const countMap = new Map(
        eventCounts.map((ec) => [ec.eventIdentityId, ec.count])
      );

      // Step 5: Combine and sort by count
      const formattedIdentities = eventIdentities
        .map((identity) => {
          const [type, name] = identity.key.split(":");
          return {
            id: identity.id,
            key: identity.key,
            type,
            name,
            category: identity.category,
            eventCount: countMap.get(identity.id) || 0,
          };
        })
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, limitNum);

      return res.status(200).json(formattedIdentities);
    } catch (error) {
      next(error);
    }
  }
);

// @route  GET /projects/:projectId/transitions
// @desc   Build a weighted transition graph around an anchor event (auto-computes if missing data)
// @query  anchorEventId - The event identity ID to start from
// @query  direction - 'forward' (default) or 'backward')
// @query  topN - Number of top transitions to return per step (default: 5, max: 20)
// @query  depth - How many steps from the anchor (default: 1, max: 5)
// @access Private
router.get(
  "/transitions",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;
    const {
      anchorEventId,
      direction = "forward",
      topN = "5",
      depth = "1",
    } = req.query;

    try {
      if (!anchorEventId || typeof anchorEventId !== "string") {
        return res
          .status(400)
          .json({ error: "anchorEventId parameter is required" });
      }

      if (direction !== "forward" && direction !== "backward") {
        return res
          .status(400)
          .json({ error: "direction must be 'forward' or 'backward'" });
      }

      const topNNum = Math.min(parseInt(topN as string) || 5, 20);
      const depthNum = Math.min(parseInt(depth as string) || 1, 5);

      // Check if transitions exist for this project
      const transitionCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(transition)
        .where(eq(transition.projectId, projectId));
      const transitionCount = transitionCountResult[0]?.count || 0;

      // Auto-compute if no transitions exist
      if (transitionCount === 0) {
        console.log(
          `[Transitions] No data found for project ${projectId}, computing...`
        );
        await computeTransitionsForProject(projectId);
      }

      // Build the transition graph level by level
      const graph: any = {
        anchor: {
          id: anchorEventId,
        },
        nodes: [],
        edges: [],
      };

      // Get anchor event details
      const anchorEvents = await db
        .select({ id: eventIdentity.id, key: eventIdentity.key })
        .from(eventIdentity)
        .where(eq(eventIdentity.id, anchorEventId))
        .limit(1);
      const anchorEvent = anchorEvents[0];

      if (!anchorEvent) {
        return res.status(404).json({ error: "Anchor event not found" });
      }

      graph.anchor.key = anchorEvent.key;

      // Track visited nodes to avoid cycles
      const visitedNodes = new Set<string>([anchorEventId]);
      const nodeMap = new Map<string, any>();

      // Add anchor node
      nodeMap.set(anchorEventId, {
        id: anchorEventId,
        key: anchorEvent.key,
        level: 0,
      });

      // BFS to explore transitions
      let currentLevel = [anchorEventId];

      for (let level = 1; level <= depthNum; level++) {
        const nextLevel: string[] = [];

        // Collect transitions from all parents, group by target id
        const aggregatedTargets = new Map<
          string,
          {
            id: string;
            key: string;
            totalCount: number;
            byParent: Array<{
              parentId: string;
              count: number;
              percentage: number | null;
              avgDurationMs: number | null;
            }>;
          }
        >();

        // Keep per-parent totals to still render "+ More" nodes
        await Promise.all(
          currentLevel.map(async (parentId) => {
            const transitions =
              direction === "forward"
                ? await getTopTransitionsFromEvent(projectId, parentId, topNNum)
                : await getTopTransitionsToEvent(projectId, parentId, topNNum);

            for (const transition of transitions) {
              const target =
                direction === "forward"
                  ? (transition as { toEvent: { id: string; key: string } })
                      .toEvent
                  : (transition as { fromEvent: { id: string; key: string } })
                      .fromEvent;

              const existing = aggregatedTargets.get(target.id);
              const transitionCount = Number(transition.count || 0);

              if (existing) {
                existing.totalCount += transitionCount;
                existing.byParent.push({
                  parentId,
                  count: transitionCount,
                  percentage: transition.percentage ?? null,
                  avgDurationMs: transition.avgDurationMs ?? null,
                });
              } else {
                aggregatedTargets.set(target.id, {
                  id: target.id,
                  key: target.key,
                  totalCount: transitionCount,
                  byParent: [
                    {
                      parentId,
                      count: transitionCount,
                      percentage: transition.percentage ?? null,
                      avgDurationMs: transition.avgDurationMs ?? null,
                    },
                  ],
                });
              }
            }

            // still add "+ More" per parent if they have more than topN transitions
            const totalTransitionsResult = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(transition)
              .where(
                and(
                  eq(transition.projectId, projectId),
                  direction === "forward"
                    ? eq(transition.fromEventIdentityId, parentId)
                    : eq(transition.toEventIdentityId, parentId)
                )
              );
            const totalTransitions = totalTransitionsResult[0]?.count || 0;

            if (totalTransitions > topNNum) {
              const moreCount = Number(totalTransitions) - topNNum;
              const moreNodeId = `${parentId}-more-${level}`;

              nodeMap.set(moreNodeId, {
                id: moreNodeId,
                key: `+ ${moreCount} more`,
                level,
                isAggregate: true,
              });

              graph.edges.push({
                from: direction === "forward" ? parentId : moreNodeId,
                to: direction === "forward" ? moreNodeId : parentId,
                count: moreCount,
                percentage: 0,
                avgDurationMs: null,
                isAggregate: true,
              });
            }
          })
        );

        // Choose topN targets for this level by aggregated totalCount
        const topTargets = Array.from(aggregatedTargets.values())
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(0, topNNum);

        // Add chosen targets and edges from parents to them
        for (const target of topTargets) {
          const existingNode = nodeMap.get(target.id);
          if (existingNode && existingNode.level < level) {
            continue; // don't re-add nodes that belong to earlier levels
          }

          if (!visitedNodes.has(target.id)) {
            visitedNodes.add(target.id);
            nextLevel.push(target.id);
            nodeMap.set(target.id, {
              id: target.id,
              key: target.key,
              level,
            });
          } else if (existingNode) {
            // update level if needed
            existingNode.level = Math.min(existingNode.level, level);
          }

          // Add edges for each parent->target pair that was returned
          for (const byParent of target.byParent) {
            graph.edges.push({
              from: direction === "forward" ? byParent.parentId : target.id,
              to: direction === "forward" ? target.id : byParent.parentId,
              count: byParent.count,
              percentage: byParent.percentage,
              avgDurationMs: byParent.avgDurationMs,
            });
          }
        }

        currentLevel = nextLevel;
      }

      // Convert node map to array and add counts
      // Fetch actual event counts for each node from the database
      const nodeIds = Array.from(nodeMap.keys()).filter(
        (id) => !id.includes("-more-")
      );

      const eventCounts = await db
        .select({
          eventIdentityId: event.eventIdentityId,
          count: sql<number>`count(*)::int`.as("count"),
        })
        .from(event)
        .innerJoin(session, eq(event.sessionId, session.id))
        .where(
          and(
            inArray(event.eventIdentityId, nodeIds),
            eq(session.projectId, projectId)
          )
        )
        .groupBy(event.eventIdentityId);

      const nodeCountMap = new Map<string, number>();
      eventCounts.forEach((result) => {
        nodeCountMap.set(result.eventIdentityId, result.count);
      });

      // Calculate exits for each node (sessions where this event is the last event)
      const exitCounts = await db.execute<{
        eventIdentityId: string;
        exitCount: string;
      }>(sql`
        WITH last_session_events AS (
          SELECT DISTINCT ON (e."sessionId")
            e."sessionId",
            e."eventIdentityId"
          FROM "Event" e
          INNER JOIN "Session" s ON e."sessionId" = s.id
          WHERE s."projectId" = ${projectId}
          ORDER BY e."sessionId", e."createdAt" DESC
        )
        SELECT 
          "eventIdentityId",
          COUNT(*)::text as "exitCount"
        FROM last_session_events
        WHERE "eventIdentityId" = ANY(${sql.raw(`ARRAY[${nodeIds.map((id) => `'${id}'`).join(",")}]`)})
        GROUP BY "eventIdentityId"
      `);

      const nodeExitMap = new Map<string, number>();
      exitCounts.forEach((result: any) => {
        nodeExitMap.set(result.eventIdentityId, Number(result.exitCount));
      });

      graph.nodes = Array.from(nodeMap.values()).map((node) => ({
        ...node,
        count: node.isAggregate ? 0 : nodeCountMap.get(node.id) || 0,
        exits: node.isAggregate ? undefined : nodeExitMap.get(node.id) || 0,
      }));

      return res.status(200).json(graph);
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /projects/:projectId/transitions/compute
// @desc   Trigger computation of transition aggregates for the project
// @access Private
router.post(
  "/transitions/compute",
  async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { projectId } = req.params;

    try {
      // This could be moved to a background job for large projects
      await computeTransitionsForProject(projectId);

      return res
        .status(200)
        .json({ message: "Transitions computed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
