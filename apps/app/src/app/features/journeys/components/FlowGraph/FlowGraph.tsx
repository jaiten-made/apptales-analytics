import dagre from "dagre";
import { intervalToDuration } from "date-fns";
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

    type FlowJson = {
      nodes: JsonNode[];
      edges: JsonEdge[];
      startNodeId?: string | number;
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

    // Traverse from start node to collect reachable nodes/edges
    const reachableNodeIds = new Set<string>();
    const reachableEdgeIds = new Set<string>();
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

    // Calculate mock traffic metrics (GA4 style)
    const totalUsers = 10000; // Starting traffic
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
        const isCompleted =
          overallStatus === "success"
            ? true
            : Boolean(jsonNode.data?.hasCompleted);
        const isStartNode = nodeId === effectiveStartNodeId;
        const metrics = nodeMetrics.get(nodeId) || {
          userCount: 0,
          percentage: 0,
          dropOffRate: 0,
        };
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

    const loadedNodes = getLayoutedElements(
      initialNodes,
      json.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
      })),
      "TB" // Top to Bottom layout
    );

    // Helper to format milliseconds to human-readable string using date-fns
    const formatDuration = (ms: unknown) => {
      if (ms == null) return "";
      const n = Number(ms);
      if (!isFinite(n) || n <= 0) return "";
      // For values below 1000ms, keep ms precision
      if (n < 1000) return `${n}ms`;

      const secondsTotal = Math.floor(n / 1000);
      const duration = intervalToDuration({
        start: 0,
        end: secondsTotal * 1000,
      });

      // Use only minutes and seconds if present, otherwise seconds
      const parts: Record<string, number> = {
        years: duration.years || 0,
        months: duration.months || 0,
        days: duration.days || 0,
        hours: duration.hours || 0,
        minutes: duration.minutes || 0,
        seconds: duration.seconds || 0,
      };

      // Produce a short string like '1m 12s' or '2h 3m' depending on magnitude
      const tokens: string[] = [];
      if (parts.years) tokens.push(`${parts.years}y`);
      if (parts.months) tokens.push(`${parts.months}mo`);
      if (parts.days) tokens.push(`${parts.days}d`);
      if (parts.hours) tokens.push(`${parts.hours}h`);
      if (parts.minutes) tokens.push(`${parts.minutes}m`);
      if (parts.seconds || tokens.length === 0)
        tokens.push(`${parts.seconds}s`);

      return tokens.join(" ");
    };

    // Build edges and attach metrics (GA4 style with traffic volume)
    const loadedEdges: Edge[] = json.edges.map((e) => {
      const sourceId = String(e.source);
      const targetId = String(e.target);

      const targetNode = json.nodes.find((n) => String(n.id) === targetId);

      const targetMetrics = nodeMetrics.get(targetId);

      // Calculate edge thickness based on user count (1-10 range)
      const userCount = targetMetrics?.userCount || 0;
      const maxUsers = totalUsers;
      const thickness = Math.max(1, Math.min(10, (userCount / maxUsers) * 10));

      // Format label with user count and duration
      const durationLabel = targetNode
        ? formatDuration(targetNode.data?.durationMs)
        : "";

      const userLabel = targetMetrics
        ? `${targetMetrics.userCount.toLocaleString()} users`
        : "";

      const label = [userLabel, durationLabel].filter(Boolean).join(" • ");

      // Color based on traffic volume
      const getEdgeColor = () => {
        if (!targetMetrics) return "#b0b0b0";
        const ratio = targetMetrics.userCount / totalUsers;
        if (ratio > 0.5) return "#388e3c"; // Green - high traffic
        if (ratio > 0.25) return "#f57c00"; // Orange - medium traffic
        return "#d32f2f"; // Red - low traffic
      };

      const edge: Edge = {
        id: String(e.id),
        source: sourceId,
        target: targetId,
        animated: Boolean(e.animated),
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

    setNodes(loadedNodes);
    setEdges(loadedEdges);
  }, [overallStatus, startNodeId]);

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
        selectedUserId={selectedUserId ?? undefined}
        onUserChange={(userId) =>
          setSelectedUserId(userId ? Number(userId) : null)
        }
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
