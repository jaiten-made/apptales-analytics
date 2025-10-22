import dagre from "dagre";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import type {
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import FilterDrawer from "../../../../components/FilterDrawer";
import CustomListNode from "./CustomListNode";
import data from "./data.json";
const nodeTypes = { listNode: CustomListNode };
// Journey list (table) data includes status for each journey id
import journeys from "../DataTable/data.json";
// User journey attempts data (per journey) includes status per attempt
import userJourneyAttempts from "../details/data.json";

// Types for imported static JSON (mock data)
interface JourneyRow {
  id: string | number;
  status?: string;
}

interface UserJourneyAttemptRow {
  id: string | number;
  journeyId?: string | number;
  status?: string;
}

interface CustomListNodeData {
  title: string;
  lines?: string[];
  hasCompleted?: boolean;
  isStartNode?: boolean;
  allNodeIds?: string[];
  allNodeLabels?: Record<string, string>;
  onChangeStartNode?: (id: string) => void;
  userCount?: number;
  percentage?: number;
  dropOffRate?: number;
  totalUsers?: number;
  isSingleUserView?: boolean;
  userDroppedOff?: boolean;
}

const FlowGraph: React.FC = () => {
  const [nodes, setNodes] = useState<Node<CustomListNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNodeId, setStartNodeId] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // read route params: /journeys/:id/user-journey/:userId?
  const { id: journeyId, userId } = useParams();

  // Effective userId is either from route or from filter selection
  const effectiveUserId =
    userId || (selectedUserId ? String(selectedUserId) : undefined);

  // Determine overall status priority order (user journey attempt first, then journey)
  const overallStatus = useMemo(() => {
    // try to find user attempt status if effectiveUserId present
    if (effectiveUserId) {
      const attempt = (userJourneyAttempts as UserJourneyAttemptRow[]).find(
        (a) =>
          String(a.id) === String(effectiveUserId) &&
          (journeyId ? String(a.journeyId) === String(journeyId) : true)
      );
      if (attempt?.status) return String(attempt.status).toLowerCase();
    }
    // otherwise fall back to journey level status
    if (journeyId) {
      const journey = (journeys as JourneyRow[]).find(
        (j) => String(j.id) === String(journeyId)
      );
      if (journey?.status) return String(journey.status).toLowerCase();
    }
    return undefined;
  }, [journeyId, effectiveUserId]);

  // Get all available user IDs for the filter
  const allUserIds = useMemo(() => {
    return Array.from(
      new Set(
        (userJourneyAttempts as UserJourneyAttemptRow[])
          .filter(
            (a) => !journeyId || String(a.journeyId) === String(journeyId)
          )
          .map((a) => a.id)
      )
    ).sort((a, b) => Number(a) - Number(b));
  }, [journeyId]);

  // Build nodes/edges whenever overallStatus changes so we can override node completion state.
  useEffect(() => {
    // Load nodes/edges from data.json with explicit types
    type JsonNode = {
      id: string | number;
      type?: string;
      data: {
        label: string;
        hasCompleted?: boolean;
        durationMs?: number | null;
      };
      position: { x: number; y: number };
      style?: Record<string, unknown>;
    };

    type JsonEdge = {
      id: string | number;
      source: string | number;
      target: string | number;
      animated?: boolean;
    };

    type UserJourneyStep = {
      nodeId: string;
      timestamp: string;
      completed: boolean;
    };

    type UserJourney = {
      userId: number;
      steps: UserJourneyStep[];
    };

    type FlowJson = {
      nodes: JsonNode[];
      edges: JsonEdge[];
      startNodeId?: string | number;
      userJourneys?: Record<string, UserJourney>;
    };

    const json = data as unknown as FlowJson;

    // Build a graph structure to traverse from start node
    const edgeMap = new Map<string, string[]>();
    json.edges.forEach((e) => {
      const sourceId = String(e.source);
      const targetId = String(e.target);
      if (!edgeMap.has(sourceId)) {
        edgeMap.set(sourceId, []);
      }
      edgeMap.get(sourceId)!.push(targetId);
    });

    // Determine the starting node
    const effectiveStartNodeId = startNodeId
      ? String(startNodeId)
      : json.startNodeId
        ? String(json.startNodeId)
        : json.nodes.length > 0
          ? String(json.nodes[0].id)
          : undefined;

    // Get user journey data if user is selected
    const userJourney =
      effectiveUserId && json.userJourneys
        ? json.userJourneys[effectiveUserId]
        : undefined;

    // If user journey exists, use it to determine which nodes/edges to show
    const reachableNodeIds = new Set<string>();
    const reachableEdgeIds = new Set<string>();

    if (userJourney) {
      // Show only the path the user took
      const userSteps = userJourney.steps;
      userSteps.forEach((step, index) => {
        reachableNodeIds.add(step.nodeId);

        // Add edge from previous step to current step
        if (index > 0) {
          const prevStep = userSteps[index - 1];
          const edge = json.edges.find(
            (e) =>
              String(e.source) === prevStep.nodeId &&
              String(e.target) === step.nodeId
          );
          if (edge) reachableEdgeIds.add(String(edge.id));
        }
      });
    } else {
      // Traverse from start node to collect reachable nodes/edges (original behavior)
      function traverse(nodeId: string) {
        if (reachableNodeIds.has(nodeId)) return;
        reachableNodeIds.add(nodeId);
        const children = edgeMap.get(nodeId) || [];
        children.forEach((childId) => {
          // Find edge connecting nodeId -> childId
          const edge = json.edges.find(
            (e) => String(e.source) === nodeId && String(e.target) === childId
          );
          if (edge) reachableEdgeIds.add(String(edge.id));
          traverse(childId);
        });
      }
      if (effectiveStartNodeId) {
        traverse(effectiveStartNodeId);
      }
    }

    // Calculate mock traffic metrics (GA4 style)
    const totalUsers = json.userJourneys
      ? Object.keys(json.userJourneys).length
      : 0;
    const nodeMetrics = new Map<
      string,
      { userCount: number; percentage: number; dropOffRate: number }
    >();
    // Calculate user counts with flow-through logic
    const calculateMetrics = (
      nodeId: string,
      incomingUsers: number
    ): number => {
      if (nodeMetrics.has(nodeId)) {
        return nodeMetrics.get(nodeId)!.userCount;
      }
      const randomDropOff = Math.random() * 0.3; // 0-30% drop-off
      const userCount = Math.floor(incomingUsers * (1 - randomDropOff));
      const percentage = (userCount / totalUsers) * 100;
      const dropOffRate = ((incomingUsers - userCount) / incomingUsers) * 100;
      nodeMetrics.set(nodeId, { userCount, percentage, dropOffRate });
      // Distribute users to children
      const children = edgeMap.get(nodeId) || [];
      if (children.length > 0) {
        children.forEach((childId) => {
          calculateMetrics(childId, userCount);
        });
      }
      return userCount;
    };
    // Start from the start node
    if (effectiveStartNodeId) {
      nodeMetrics.set(effectiveStartNodeId, {
        userCount: totalUsers,
        percentage: 100,
        dropOffRate: 0,
      });
      const children = edgeMap.get(effectiveStartNodeId) || [];
      children.forEach((childId) => {
        calculateMetrics(childId, totalUsers);
      });
    }

    // Only show reachable nodes/edges (or just the start node if nothing selected yet)
    const allNodeIds = json.nodes.map((n) => String(n.id));
    const allNodeLabels: Record<string, string> = {};
    json.nodes.forEach((n) => {
      allNodeLabels[String(n.id)] = String(n.data.label);
    });
    const initialNodes: Node<CustomListNodeData>[] = json.nodes
      .filter((n) => {
        const nodeId = String(n.id);
        // If no start node selected, show the first node (or default from data.json)
        if (!startNodeId) {
          const defaultStartId = json.startNodeId
            ? String(json.startNodeId)
            : json.nodes.length > 0
              ? String(json.nodes[0].id)
              : undefined;
          return nodeId === defaultStartId;
        }
        // Otherwise, show only reachable nodes from selected start
        return reachableNodeIds.has(nodeId);
      })
      .map((n) => {
        const nodeId = String(n.id);
        const labelText = String(n.data.label);
        const jsonNode = n as JsonNode;
        // Check if this node was completed by the user (if viewing a user journey)
        let isCompleted =
          overallStatus === "success"
            ? true
            : Boolean(jsonNode.data?.hasCompleted);

        if (userJourney) {
          // Override completion status based on user's actual steps
          const userStep = userJourney.steps.find(
            (step) => step.nodeId === nodeId
          );
          isCompleted = userStep ? userStep.completed : false;
        }

        const isStartNode = nodeId === effectiveStartNodeId;
        const metrics = nodeMetrics.get(nodeId) || {
          userCount: 0,
          percentage: 0,
          dropOffRate: 0,
        };

        // Check if user dropped off at this node
        let userDroppedOff = false;
        if (userJourney) {
          const userStep = userJourney.steps.find(
            (step) => step.nodeId === nodeId
          );
          if (userStep) {
            // If user reached this node but didn't complete it, they dropped off
            userDroppedOff = !userStep.completed;

            // Check if this was their last completed step
            const stepIndex = userJourney.steps.indexOf(userStep);
            if (
              stepIndex === userJourney.steps.length - 1 &&
              userStep.completed
            ) {
              // They completed this step and it was their last
              // Only mark as drop-off if there are outgoing edges (meaning they could have continued)
              const hasOutgoingEdges = edgeMap.has(nodeId);
              userDroppedOff = hasOutgoingEdges;
            }
          }
        }

        return {
          id: nodeId,
          position: { x: 0, y: 0 }, // Temporary position
          type: "listNode",
          data: {
            title: labelText.split("\n")[0] ?? "",
            lines: labelText.split("\n").slice(1),
            hasCompleted: isCompleted,
            isStartNode,
            allNodeIds: isStartNode ? allNodeIds : undefined,
            allNodeLabels: isStartNode ? allNodeLabels : undefined,
            onChangeStartNode: isStartNode
              ? (id: string) => {
                  setStartNodeId(id);
                }
              : undefined,
            userCount: metrics.userCount,
            percentage: metrics.percentage,
            dropOffRate: metrics.dropOffRate,
            totalUsers,
            isSingleUserView: Boolean(userJourney),
            userDroppedOff,
          },
        };
      });

    // Use Dagre to calculate optimal layout
    const getLayoutedElements = (
      nodes: Node<CustomListNodeData>[],
      edges: { id: string; source: string; target: string }[],
      direction: "TB" | "LR" = "TB"
    ) => {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      // Configure graph layout
      dagreGraph.setGraph({
        rankdir: direction, // TB = top to bottom, LR = left to right
        nodesep: 120, // Horizontal spacing between nodes
        ranksep: 180, // Vertical spacing between ranks
        marginx: 50,
        marginy: 50,
      });

      // Add nodes to dagre
      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 280, height: 180 });
      });

      // Add edges to dagre
      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      // Calculate layout
      dagre.layout(dagreGraph);

      // Find the start node's calculated position
      const startNode = nodes.find((n) => n.data.isStartNode);
      let offsetX = 0;
      let offsetY = 0;

      if (startNode) {
        const startNodePosition = dagreGraph.node(startNode.id);
        // Calculate offset to position start node at fixed location
        const fixedStartX = 300; // Fixed X position (centered)
        const fixedStartY = 50; // Fixed Y position (top)
        offsetX = fixedStartX - (startNodePosition.x - 140);
        offsetY = fixedStartY - (startNodePosition.y - 90);
      }

      // Apply calculated positions to all nodes with offset
      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 140 + offsetX, // Center node + offset
            y: nodeWithPosition.y - 90 + offsetY, // Center node + offset
          },
        };
      });

      return layoutedNodes;
    };

    let loadedNodes = getLayoutedElements(
      initialNodes,
      json.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
      })),
      "TB" // Top to Bottom layout
    );

    // Removed duration formatting since labels no longer include time

    // Calculate edge statistics: how many users took each edge and percentage vs alternatives
    const edgeStats = new Map<string, { count: number; percentage: number }>();

    if (json.userJourneys) {
      // Count how many times each edge was traversed
      const edgeTraversalCount = new Map<string, number>();
      const sourceNodeTraversalCount = new Map<string, number>();

      Object.values(json.userJourneys).forEach((journey) => {
        journey.steps.forEach((step, index) => {
          if (index > 0) {
            const prevStep = journey.steps[index - 1];
            const edgeKey = `${prevStep.nodeId}->${step.nodeId}`;
            edgeTraversalCount.set(
              edgeKey,
              (edgeTraversalCount.get(edgeKey) || 0) + 1
            );

            // Count how many times users left from the source node
            sourceNodeTraversalCount.set(
              prevStep.nodeId,
              (sourceNodeTraversalCount.get(prevStep.nodeId) || 0) + 1
            );
          }
        });
      });

      // Calculate percentages
      edgeTraversalCount.forEach((count, edgeKey) => {
        const [sourceNode] = edgeKey.split("->");
        const totalFromSource = sourceNodeTraversalCount.get(sourceNode) || 1;
        const percentage = (count / totalFromSource) * 100;
        edgeStats.set(edgeKey, { count, percentage });
      });
    }

    // Per-user edge stats (when a specific user is selected):
    // count how many times the selected user took each edge, and percentage vs that user's alternatives from the same source.
    const userEdgeTraversalCount = new Map<string, number>();
    const userSourceTraversalCount = new Map<string, number>();
    if (userJourney) {
      const steps = userJourney.steps;
      steps.forEach((step, index) => {
        if (index > 0) {
          const prev = steps[index - 1];
          const edgeKey = `${prev.nodeId}->${step.nodeId}`;
          userEdgeTraversalCount.set(
            edgeKey,
            (userEdgeTraversalCount.get(edgeKey) || 0) + 1
          );
          userSourceTraversalCount.set(
            prev.nodeId,
            (userSourceTraversalCount.get(prev.nodeId) || 0) + 1
          );
        }
      });
    }

    // Build edges and attach metrics (GA4 style with traffic volume)
    let loadedEdges: Edge[] = json.edges
      .filter((e) => {
        // Only show edges that are reachable
        return reachableEdgeIds.has(String(e.id));
      })
      .map((e) => {
        const sourceId = String(e.source);
        const targetId = String(e.target);
        const edgeKey = `${sourceId}->${targetId}`;

        const targetMetrics = nodeMetrics.get(targetId);
        const edgeStat = edgeStats.get(edgeKey);

        // Check if this edge is part of the user's journey
        const isUserJourneyEdge = userJourney
          ? userJourney.steps.some((step, index) => {
              if (index === 0) return false;
              const prevStep = userJourney.steps[index - 1];
              return prevStep.nodeId === sourceId && step.nodeId === targetId;
            })
          : false;

        // Calculate edge thickness based on user journey or user count
        let thickness: number;
        if (userJourney) {
          thickness = isUserJourneyEdge ? 4 : 2; // Highlight user's path
        } else if (edgeStat) {
          // Base thickness on percentage (1-8 range)
          thickness = Math.max(2, Math.min(8, (edgeStat.percentage / 100) * 8));
        } else {
          const userCount = targetMetrics?.userCount || 0;
          const maxUsers = totalUsers;
          thickness = Math.max(1, Math.min(10, (userCount / maxUsers) * 10));
        }

        // Format label with count and percentage (no duration)
        let label = "";
        if (userJourney) {
          // For selected user: show how many times THEY did this action and the % of THEIR choices from this source
          const userCountOnEdge = userEdgeTraversalCount.get(edgeKey) || 0;
          const userDeparturesFromSource =
            userSourceTraversalCount.get(sourceId) || 0;
          const userPercentage = userDeparturesFromSource
            ? Math.round((userCountOnEdge / userDeparturesFromSource) * 100)
            : 0;
          const timesText =
            userCountOnEdge === 1 ? "1 time" : `${userCountOnEdge} times`;
          label = `${timesText} • ${userPercentage}%`;
        } else if (edgeStat) {
          // Aggregate view: show total times across users and percentage vs alternatives from the same node
          const timesText =
            edgeStat.count === 1 ? "1 time" : `${edgeStat.count} times`;
          label = `${timesText} • ${edgeStat.percentage.toFixed(0)}%`;
        } else {
          // Fallback (no stats available)
          label = "";
        }

        // Color based on traffic volume or user journey
        const getEdgeColor = () => {
          if (userJourney) {
            // Check if this edge leads to a drop-off point
            const targetStep = userJourney.steps.find(
              (step) => step.nodeId === targetId
            );
            const isTargetLastStep = targetStep
              ? userJourney.steps.indexOf(targetStep) ===
                userJourney.steps.length - 1
              : false;
            const targetNotCompleted = targetStep && !targetStep.completed;

            // Only mark edge as red if it leads to an INCOMPLETE action
            // OR if it leads to the last step that has outgoing edges (could have continued)
            if (isUserJourneyEdge && targetNotCompleted) {
              return "#d32f2f"; // Red - leads to incomplete action
            }

            // If target is the last step and completed, check if there were more possible steps
            if (
              isUserJourneyEdge &&
              isTargetLastStep &&
              targetStep?.completed
            ) {
              const targetHasOutgoingEdges = edgeMap.has(targetId);
              if (targetHasOutgoingEdges) {
                // This edge leads to a node where user could have continued but didn't
                // Don't color this edge red - the drop-off indicator will show after
                return "#1976d2"; // Blue for user's path
              }
            }

            return isUserJourneyEdge ? "#1976d2" : "#b0b0b0"; // Blue for user's path
          }
          // Aggregate view: always green for edges
          return "#388e3c"; // Green for all edges in aggregate view
        };

        const edge: Edge = {
          id: String(e.id),
          source: sourceId,
          target: targetId,
          animated: isUserJourneyEdge || Boolean(e.animated),
          label: label || undefined,
          labelStyle: label
            ? {
                fontSize: 11,
                fill: "#555",
                fontWeight: 600,
                background: "white",
                padding: "4px 8px",
                borderRadius: "4px",
              }
            : undefined,
          style: {
            strokeWidth: thickness,
            stroke: getEdgeColor(),
          },
          type: "bezier",
        };
        return edge;
      });

    // Add drop-off indicator if user dropped off (didn't complete the journey)
    if (userJourney) {
      const lastStep = userJourney.steps[userJourney.steps.length - 1];
      const lastNode = loadedNodes.find((n) => n.id === lastStep.nodeId);

      // Determine if user dropped off:
      // 1. If last step was NOT completed (they started but didn't finish the action)
      // 2. If last step was completed BUT there are more possible steps (they could have continued but didn't)
      let droppedOff = false;

      if (!lastStep.completed) {
        // User started this action but didn't complete it
        droppedOff = true;
      } else if (lastNode) {
        // User completed this action, but check if there were more steps available
        const hasOutgoingEdges = edgeMap.has(lastStep.nodeId);
        if (hasOutgoingEdges) {
          droppedOff = true;
        }
      }

      if (droppedOff && lastNode) {
        // Create an invisible target node for the drop-off edge
        const dropOffTargetId = `drop-off-target-${lastStep.nodeId}`;
        const dropOffTargetNode: Node = {
          id: dropOffTargetId,
          position: {
            x: lastNode.position.x + 140, // Center horizontally
            y: lastNode.position.y + 200, // Position below the last node
          },
          data: {},
          style: {
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          },
          draggable: false,
          selectable: false,
          connectable: false,
        };

        // Create red dashed edge pointing to the invisible node (appears to point to nothing)
        const dropOffEdge: Edge = {
          id: `drop-off-edge-${lastStep.nodeId}`,
          source: lastStep.nodeId,
          target: dropOffTargetId,
          animated: true,
          label: "Dropped off",
          labelStyle: {
            fontSize: 11,
            fill: "#d32f2f",
            fontWeight: 700,
            background: "white",
            padding: "4px 8px",
            borderRadius: "4px",
          },
          style: {
            strokeWidth: 4,
            stroke: "#d32f2f",
            strokeDasharray: "5,5",
          },
          type: "straight",
          markerEnd: undefined, // Remove arrow at the end
        };

        loadedNodes = [...loadedNodes, dropOffTargetNode];
        loadedEdges = [...loadedEdges, dropOffEdge];
      }
    }

    setNodes(loadedNodes);
    setEdges(loadedEdges);
  }, [overallStatus, startNodeId, effectiveUserId]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // Prepare data for FilterDrawer
  const allNodeIds = useMemo(() => {
    const json = data as unknown as {
      nodes: Array<{ id: string | number; data: { label: string } }>;
    };
    return json.nodes.map((n) => String(n.id));
  }, []);

  const allNodeLabels = useMemo(() => {
    const json = data as unknown as {
      nodes: Array<{ id: string | number; data: { label: string } }>;
    };
    const labels: Record<string, string> = {};
    json.nodes.forEach((n) => {
      labels[String(n.id)] = String(n.data.label);
    });
    return labels;
  }, []);

  return (
    <div className="flex h-full w-full">
      <FilterDrawer
        allNodeIds={allNodeIds}
        allNodeLabels={allNodeLabels}
        selectedStartNodeId={startNodeId}
        onStartNodeChange={setStartNodeId}
        allUserIds={allUserIds}
        selectedUserId={selectedUserId ?? "all"}
        onUserChange={(userId) => {
          if (userId === "all") {
            setSelectedUserId(null);
          } else {
            setSelectedUserId(Number(userId));
          }
        }}
      />
      <div className="flex-1 bg-gray-50">
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.5,
          }}
          nodesDraggable={false}
          elementsSelectable={true}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "bezier",
            animated: false,
          }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls showInteractive={false} />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowGraph;
