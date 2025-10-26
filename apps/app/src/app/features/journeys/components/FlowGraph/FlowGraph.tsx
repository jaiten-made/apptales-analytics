import dagre from "dagre";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import type {
  Connection,
  Edge,
  EdgeProps,
  Node,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import ReactFlow, {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import FilterDrawer from "../../../../components/FilterDrawer";
import userJourneyAttempts from "../../data/attempts.json";
import data from "../../data/flow.json";
import journeys from "../../data/journeys.json";
import CustomListNode from "./CustomListNode";

// ============================================================================
// Types
// ============================================================================

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

type NodeMetrics = {
  userCount: number;
  percentage: number;
  dropOffRate: number;
};

type EdgeStats = {
  count: number;
  percentage: number;
};

// ============================================================================
// Constants
// ============================================================================

const nodeTypes = { listNode: CustomListNode };

const LAYOUT_CONFIG = {
  nodeWidth: 280,
  nodeHeight: 180,
  nodesep: 120,
  ranksep: 180,
  marginx: 50,
  marginy: 50,
  fixedStartX: 300,
  fixedStartY: 50,
};

const DROP_OFF_CONFIG = {
  length: 140,
  targetOffsetY: 200,
};

// ============================================================================
// Custom Edge Component
// ============================================================================

const DropOffEdge: React.FC<EdgeProps> = (props) => {
  const { id, sourceX, sourceY, selected, style, label } = props;

  const y1 = sourceY;
  const y2 = y1 + DROP_OFF_CONFIG.length;
  const path = `M ${sourceX},${y1} L ${sourceX},${y2}`;

  const labelX = sourceX;
  const labelY = (y1 + y2) / 2;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              fontSize: 11,
              color: "#555",
              fontWeight: 700,
              background: "white",
              padding: "4px 8px",
              borderRadius: 4,
              border: selected ? "1px solid #bbb" : "none",
              whiteSpace: "nowrap",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

const buildEdgeMap = (edges: JsonEdge[]): Map<string, string[]> => {
  const edgeMap = new Map<string, string[]>();
  edges.forEach((e) => {
    const sourceId = String(e.source);
    const targetId = String(e.target);
    if (!edgeMap.has(sourceId)) {
      edgeMap.set(sourceId, []);
    }
    edgeMap.get(sourceId)!.push(targetId);
  });
  return edgeMap;
};

const determineStartNode = (
  startNodeId: string | undefined,
  json: FlowJson
): string | undefined => {
  if (startNodeId) return String(startNodeId);
  if (json.startNodeId) return String(json.startNodeId);
  if (json.nodes.length > 0) return String(json.nodes[0].id);
  return undefined;
};

const collectReachableNodes = (
  userJourney: UserJourney | undefined,
  effectiveStartNodeId: string | undefined,
  json: FlowJson,
  edgeMap: Map<string, string[]>
): { nodeIds: Set<string>; edgeIds: Set<string> } => {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  if (userJourney) {
    userJourney.steps.forEach((step, index) => {
      nodeIds.add(step.nodeId);
      if (index > 0) {
        const prevStep = userJourney.steps[index - 1];
        const edge = json.edges.find(
          (e) =>
            String(e.source) === prevStep.nodeId &&
            String(e.target) === step.nodeId
        );
        if (edge) edgeIds.add(String(edge.id));
      }
    });
  } else {
    const traverse = (nodeId: string) => {
      if (nodeIds.has(nodeId)) return;
      nodeIds.add(nodeId);
      const children = edgeMap.get(nodeId) || [];
      children.forEach((childId) => {
        const edge = json.edges.find(
          (e) => String(e.source) === nodeId && String(e.target) === childId
        );
        if (edge) edgeIds.add(String(edge.id));
        traverse(childId);
      });
    };
    if (effectiveStartNodeId) traverse(effectiveStartNodeId);
  }

  return { nodeIds, edgeIds };
};

const calculateNodeMetrics = (
  effectiveStartNodeId: string | undefined,
  totalUsers: number,
  edgeMap: Map<string, string[]>
): Map<string, NodeMetrics> => {
  const nodeMetrics = new Map<string, NodeMetrics>();

  const calculateMetrics = (nodeId: string, incomingUsers: number): number => {
    if (nodeMetrics.has(nodeId)) {
      return nodeMetrics.get(nodeId)!.userCount;
    }
    const randomDropOff = Math.random() * 0.3;
    const userCount = Math.floor(incomingUsers * (1 - randomDropOff));
    const percentage = (userCount / totalUsers) * 100;
    const dropOffRate = ((incomingUsers - userCount) / incomingUsers) * 100;
    nodeMetrics.set(nodeId, { userCount, percentage, dropOffRate });

    const children = edgeMap.get(nodeId) || [];
    children.forEach((childId) => calculateMetrics(childId, userCount));
    return userCount;
  };

  if (effectiveStartNodeId) {
    nodeMetrics.set(effectiveStartNodeId, {
      userCount: totalUsers,
      percentage: 100,
      dropOffRate: 0,
    });
    const children = edgeMap.get(effectiveStartNodeId) || [];
    children.forEach((childId) => calculateMetrics(childId, totalUsers));
  }

  return nodeMetrics;
};

const calculateEdgeStats = (
  json: FlowJson
): {
  edgeStats: Map<string, EdgeStats>;
  userEdgeStats: Map<
    string,
    { traversalCount: Map<string, number>; sourceCount: Map<string, number> }
  >;
} => {
  const edgeStats = new Map<string, EdgeStats>();
  const userEdgeStats = new Map<
    string,
    { traversalCount: Map<string, number>; sourceCount: Map<string, number> }
  >();

  if (!json.userJourneys) return { edgeStats, userEdgeStats };

  const edgeTraversalCount = new Map<string, number>();
  const sourceNodeTraversalCount = new Map<string, number>();

  Object.entries(json.userJourneys).forEach(([userId, journey]) => {
    const userTraversalCount = new Map<string, number>();
    const userSourceCount = new Map<string, number>();

    journey.steps.forEach((step, index) => {
      if (index > 0) {
        const prevStep = journey.steps[index - 1];
        const edgeKey = `${prevStep.nodeId}->${step.nodeId}`;

        edgeTraversalCount.set(
          edgeKey,
          (edgeTraversalCount.get(edgeKey) || 0) + 1
        );
        sourceNodeTraversalCount.set(
          prevStep.nodeId,
          (sourceNodeTraversalCount.get(prevStep.nodeId) || 0) + 1
        );

        userTraversalCount.set(
          edgeKey,
          (userTraversalCount.get(edgeKey) || 0) + 1
        );
        userSourceCount.set(
          prevStep.nodeId,
          (userSourceCount.get(prevStep.nodeId) || 0) + 1
        );
      }
    });

    userEdgeStats.set(userId, {
      traversalCount: userTraversalCount,
      sourceCount: userSourceCount,
    });
  });

  edgeTraversalCount.forEach((count, edgeKey) => {
    const [sourceNode] = edgeKey.split("->");
    const totalFromSource = sourceNodeTraversalCount.get(sourceNode) || 1;
    const percentage = (count / totalFromSource) * 100;
    edgeStats.set(edgeKey, { count, percentage });
  });

  return { edgeStats, userEdgeStats };
};

const layoutNodesWithDagre = (
  nodes: Node<CustomListNodeData>[],
  edges: { id: string; source: string; target: string }[]
): Node<CustomListNodeData>[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: LAYOUT_CONFIG.nodesep,
    ranksep: LAYOUT_CONFIG.ranksep,
    marginx: LAYOUT_CONFIG.marginx,
    marginy: LAYOUT_CONFIG.marginy,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const startNode = nodes.find((n) => n.data.isStartNode);
  let offsetX = 0;
  let offsetY = 0;

  if (startNode) {
    const startNodePosition = dagreGraph.node(startNode.id);
    offsetX =
      LAYOUT_CONFIG.fixedStartX -
      (startNodePosition.x - LAYOUT_CONFIG.nodeWidth / 2);
    offsetY =
      LAYOUT_CONFIG.fixedStartY -
      (startNodePosition.y - LAYOUT_CONFIG.nodeHeight / 2);
  }

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2 + offsetX,
        y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2 + offsetY,
      },
    };
  });
};

const getEdgeColor = (
  userJourney: UserJourney | undefined,
  isUserJourneyEdge: boolean
): string => {
  if (userJourney) {
    return isUserJourneyEdge ? "#1976d2" : "#b0b0b0";
  }
  return "#388e3c";
};

const calculateEdgeThickness = (
  userJourney: UserJourney | undefined,
  isUserJourneyEdge: boolean,
  edgeStat: EdgeStats | undefined,
  targetMetrics: NodeMetrics | undefined,
  totalUsers: number
): number => {
  if (userJourney) {
    return isUserJourneyEdge ? 4 : 2;
  }
  if (edgeStat) {
    return Math.max(2, Math.min(8, (edgeStat.percentage / 100) * 8));
  }
  const userCount = targetMetrics?.userCount || 0;
  return Math.max(1, Math.min(10, (userCount / totalUsers) * 10));
};

const formatEdgeLabel = (
  userJourney: UserJourney | undefined,
  edgeStat: EdgeStats | undefined,
  userEdgeTraversalCount: Map<string, number>,
  userSourceTraversalCount: Map<string, number>,
  edgeKey: string,
  sourceId: string
): string => {
  if (userJourney) {
    const userCountOnEdge = userEdgeTraversalCount.get(edgeKey) || 0;
    const userDeparturesFromSource =
      userSourceTraversalCount.get(sourceId) || 0;
    const userPercentage = userDeparturesFromSource
      ? Math.round((userCountOnEdge / userDeparturesFromSource) * 100)
      : 0;
    const timesText =
      userCountOnEdge === 1 ? "1 time" : `${userCountOnEdge} times`;
    return `${timesText} • ${userPercentage}%`;
  }
  if (edgeStat) {
    const timesText =
      edgeStat.count === 1 ? "1 time" : `${edgeStat.count} times`;
    return `${timesText} • ${edgeStat.percentage.toFixed(0)}%`;
  }
  return "";
};

// ============================================================================
// Main Component
// ============================================================================

const FlowGraph: React.FC = () => {
  const [nodes, setNodes] = useState<Node<CustomListNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNodeId, setStartNodeId] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { id: journeyId, userId } = useParams();
  const effectiveUserId =
    userId || (selectedUserId ? String(selectedUserId) : undefined);

  const overallStatus = useMemo(() => {
    if (effectiveUserId) {
      const attempt = (userJourneyAttempts as UserJourneyAttemptRow[]).find(
        (a) =>
          String(a.id) === String(effectiveUserId) &&
          (journeyId ? String(a.journeyId) === String(journeyId) : true)
      );
      if (attempt?.status) return String(attempt.status).toLowerCase();
    }
    if (journeyId) {
      const journey = (journeys as JourneyRow[]).find(
        (j) => String(j.id) === String(journeyId)
      );
      if (journey?.status) return String(journey.status).toLowerCase();
    }
    return undefined;
  }, [journeyId, effectiveUserId]);

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

  useEffect(() => {
    const json = data as unknown as FlowJson;
    const edgeMap = buildEdgeMap(json.edges);
    const effectiveStartNodeId = determineStartNode(startNodeId, json);
    const userJourney =
      effectiveUserId && json.userJourneys
        ? json.userJourneys[effectiveUserId]
        : undefined;

    const { nodeIds: reachableNodeIds, edgeIds: reachableEdgeIds } =
      collectReachableNodes(userJourney, effectiveStartNodeId, json, edgeMap);

    const totalUsers = json.userJourneys
      ? Object.keys(json.userJourneys).length
      : 0;
    const nodeMetrics = calculateNodeMetrics(
      effectiveStartNodeId,
      totalUsers,
      edgeMap
    );
    const { edgeStats, userEdgeStats } = calculateEdgeStats(json);

    const userEdgeTraversalCount =
      effectiveUserId && userEdgeStats.has(effectiveUserId)
        ? userEdgeStats.get(effectiveUserId)!.traversalCount
        : new Map<string, number>();
    const userSourceTraversalCount =
      effectiveUserId && userEdgeStats.has(effectiveUserId)
        ? userEdgeStats.get(effectiveUserId)!.sourceCount
        : new Map<string, number>();

    const allNodeIds = json.nodes.map((n) => String(n.id));
    const allNodeLabels: Record<string, string> = {};
    json.nodes.forEach((n) => {
      allNodeLabels[String(n.id)] = String(n.data.label);
    });

    const initialNodes: Node<CustomListNodeData>[] = json.nodes
      .filter((n) => {
        const nodeId = String(n.id);
        if (!startNodeId) {
          const defaultStartId = determineStartNode(undefined, json);
          return nodeId === defaultStartId;
        }
        return reachableNodeIds.has(nodeId);
      })
      .map((n) => {
        const nodeId = String(n.id);
        const labelText = String(n.data.label);
        const jsonNode = n as JsonNode;

        let isCompleted =
          overallStatus === "success"
            ? true
            : Boolean(jsonNode.data?.hasCompleted);
        if (userJourney) {
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

        let userDroppedOff = false;
        if (userJourney) {
          const userStep = userJourney.steps.find(
            (step) => step.nodeId === nodeId
          );
          if (userStep) {
            userDroppedOff = !userStep.completed;
            const stepIndex = userJourney.steps.indexOf(userStep);
            if (
              stepIndex === userJourney.steps.length - 1 &&
              userStep.completed
            ) {
              userDroppedOff = edgeMap.has(nodeId);
            }
          }
        }

        return {
          id: nodeId,
          position: { x: 0, y: 0 },
          type: "listNode",
          data: {
            title: labelText.split("\n")[0] ?? "",
            lines: labelText.split("\n").slice(1),
            hasCompleted: isCompleted,
            isStartNode,
            allNodeIds: isStartNode ? allNodeIds : undefined,
            allNodeLabels: isStartNode ? allNodeLabels : undefined,
            onChangeStartNode: isStartNode
              ? (id: string) => setStartNodeId(id)
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

    let loadedNodes = layoutNodesWithDagre(
      initialNodes,
      json.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
      }))
    );

    let loadedEdges: Edge[] = json.edges
      .filter((e) => reachableEdgeIds.has(String(e.id)))
      .map((e) => {
        const sourceId = String(e.source);
        const targetId = String(e.target);
        const edgeKey = `${sourceId}->${targetId}`;

        const targetMetrics = nodeMetrics.get(targetId);
        const edgeStat = edgeStats.get(edgeKey);

        const isUserJourneyEdge = userJourney
          ? userJourney.steps.some((step, index) => {
              if (index === 0) return false;
              const prevStep = userJourney.steps[index - 1];
              return prevStep.nodeId === sourceId && step.nodeId === targetId;
            })
          : false;

        const thickness = calculateEdgeThickness(
          userJourney,
          isUserJourneyEdge,
          edgeStat,
          targetMetrics,
          totalUsers
        );
        const label = formatEdgeLabel(
          userJourney,
          edgeStat,
          userEdgeTraversalCount,
          userSourceTraversalCount,
          edgeKey,
          sourceId
        );

        return {
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
            stroke: getEdgeColor(userJourney, isUserJourneyEdge),
          },
          type: "bezier",
        };
      });

    // Add drop-off indicator
    if (userJourney) {
      const lastStep = userJourney.steps[userJourney.steps.length - 1];
      const lastNode = loadedNodes.find((n) => n.id === lastStep.nodeId);

      const droppedOff =
        !lastStep.completed || (lastNode && edgeMap.has(lastStep.nodeId));

      if (droppedOff && lastNode) {
        const dropOffTargetId = `drop-off-target-${lastStep.nodeId}`;
        const dropOffTargetNode: Node = {
          id: dropOffTargetId,
          position: {
            x: lastNode.position.x + LAYOUT_CONFIG.nodeWidth / 2,
            y: lastNode.position.y + DROP_OFF_CONFIG.targetOffsetY,
          },
          data: {},
          style: { width: 1, height: 1, opacity: 0, pointerEvents: "none" },
          draggable: false,
          selectable: false,
          connectable: false,
        };

        const siblingEdges = loadedEdges.filter(
          (e) => e.source === lastStep.nodeId
        );
        const matchedStrokeWidth =
          siblingEdges.length > 0
            ? Math.max(
                ...siblingEdges.map((e) =>
                  Number((e.style as any)?.strokeWidth ?? 2)
                )
              )
            : 4;

        const dropOffEdge: Edge = {
          id: `drop-off-edge-${lastStep.nodeId}`,
          source: lastStep.nodeId,
          target: dropOffTargetId,
          animated: false,
          label: "Dropped off",
          style: { strokeWidth: matchedStrokeWidth, stroke: "#d32f2f" },
          type: "dropoff",
          markerEnd: undefined,
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

  const allNodeIds = useMemo(() => {
    const json = data as unknown as FlowJson;
    return json.nodes.map((n) => String(n.id));
  }, []);

  const allNodeLabels = useMemo(() => {
    const json = data as unknown as FlowJson;
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
          edgeTypes={{ dropoff: DropOffEdge }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
          nodesDraggable={false}
          elementsSelectable={true}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "bezier", animated: false }}
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
