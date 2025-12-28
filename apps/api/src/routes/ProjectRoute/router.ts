import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma/client";
import { AuthRequest, requireAuth } from "../../middleware/auth";
import { requireProjectOwnership } from "../../middleware/project";
import {
  computeTransitionsForProject,
  getTopTransitionsFromEvent,
  getTopTransitionsToEvent,
} from "../../services/transition";

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
// @desc   Get unique event identities for a project filtered by category
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
      // Build where clause with required category filter
      const whereClause: any = {
        events: {
          some: {
            session: {
              projectId,
            },
          },
        },
      };

      // Add category filter if provided
      if (category && typeof category === "string") {
        whereClause.category = category;
      }

      // Add search filter if provided
      if (search && typeof search === "string" && search.length >= 2) {
        whereClause.key = {
          contains: search,
          mode: "insensitive",
        };
      }

      const eventIdentities = await prisma.eventIdentity.findMany({
        where: whereClause,
        select: {
          id: true,
          key: true,
          category: true,
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
        take: Math.min(parseInt(limit as string) || 50, 100),
      });

      // Parse event keys into type and name
      const formattedIdentities = eventIdentities.map((identity) => {
        const [type, name] = identity.key.split(":");
        return {
          id: identity.id,
          key: identity.key,
          type,
          name,
          category: identity.category,
          eventCount: identity._count.events,
        };
      });

      return res.status(200).json(formattedIdentities);
    } catch (error) {
      next(error);
    }
  }
);

// @route  GET /projects/:projectId/transitions
// @desc   Get weighted transitions from or to an anchor event (auto-computes if needed)
// @query  anchorEventId - The event identity ID to start from
// @query  direction - 'forward' (default) or 'backward'
// @query  topN - Number of top transitions to return (default: 5)
// @query  depth - How many levels deep to explore (default: 1)
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
      const transitionCount = await prisma.transition.count({
        where: { projectId },
      });

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
      const anchorEvent = await prisma.eventIdentity.findUnique({
        where: { id: anchorEventId },
        select: { id: true, key: true },
      });

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

        for (const nodeId of currentLevel) {
          const transitions =
            direction === "forward"
              ? await getTopTransitionsFromEvent(projectId, nodeId, topNNum)
              : await getTopTransitionsToEvent(projectId, nodeId, topNNum);

          for (const transition of transitions) {
            const targetNode =
              direction === "forward"
                ? (transition as { toEvent: { id: string; key: string } })
                    .toEvent
                : (transition as { fromEvent: { id: string; key: string } })
                    .fromEvent;

            // Skip edges that point back to earlier steps
            const existingNode = nodeMap.get(targetNode.id);
            if (existingNode && existingNode.level < level) {
              continue; // Skip this transition - it goes backward
            }

            // Add edge
            graph.edges.push({
              from: direction === "forward" ? nodeId : targetNode.id,
              to: direction === "forward" ? targetNode.id : nodeId,
              count: transition.count,
              percentage: transition.percentage,
              avgDurationMs: transition.avgDurationMs,
            });

            // Add node if not visited
            if (!visitedNodes.has(targetNode.id)) {
              visitedNodes.add(targetNode.id);
              nextLevel.push(targetNode.id);
              nodeMap.set(targetNode.id, {
                id: targetNode.id,
                key: targetNode.key,
                level,
              });
            }
          }

          // Calculate if there are more transitions beyond topN
          const totalTransitions =
            direction === "forward"
              ? await prisma.transition.count({
                  where: {
                    projectId,
                    fromEventIdentityId: nodeId,
                  },
                })
              : await prisma.transition.count({
                  where: {
                    projectId,
                    toEventIdentityId: nodeId,
                  },
                });

          if (totalTransitions > topNNum) {
            const moreCount = totalTransitions - topNNum;
            const moreNodeId = `${nodeId}-more-${level}`;

            // Add "+ More" node
            nodeMap.set(moreNodeId, {
              id: moreNodeId,
              key: `+ ${moreCount} more`,
              level,
              isAggregate: true,
            });

            // Add edge to "+ More"
            graph.edges.push({
              from: direction === "forward" ? nodeId : moreNodeId,
              to: direction === "forward" ? moreNodeId : nodeId,
              count: moreCount,
              percentage: 0, // Could calculate this
              avgDurationMs: null,
              isAggregate: true,
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

      const eventCounts = await prisma.event.groupBy({
        by: ["eventIdentityId"],
        where: {
          eventIdentityId: {
            in: nodeIds,
          },
          session: {
            projectId,
          },
        },
        _count: {
          id: true,
        },
      });

      const nodeCountMap = new Map<string, number>();
      eventCounts.forEach((result) => {
        nodeCountMap.set(result.eventIdentityId, result._count.id);
      });

      graph.nodes = Array.from(nodeMap.values()).map((node) => ({
        ...node,
        count: node.isAggregate ? 0 : nodeCountMap.get(node.id) || 0,
      }));

      return res.status(200).json(graph);
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /projects/:projectId/transitions/compute
// @desc   Trigger computation of transitions for a project
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
