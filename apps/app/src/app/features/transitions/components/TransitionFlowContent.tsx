import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import ReactFlow, {
  type Edge,
  type Node,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import type { TransitionGraph } from "../../../../lib/redux/api/projects/project/project";
import { TransitionNode } from "./TransitionNode";

interface TransitionFlowContentProps {
  data: TransitionGraph | undefined;
  isLoading: boolean;
  direction: "forward" | "backward";
}

const nodeTypes = {
  transitionNode: TransitionNode,
};

// Layout configuration
const LEVEL_HEIGHT = 100;
const NODE_WIDTH = 250;

function transformDataToReactFlow(
  data: TransitionGraph,
  direction: "forward" | "backward"
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group nodes by level
  const nodesByLevel = new Map<number, typeof data.nodes>();
  for (const node of data.nodes) {
    const levelNodes = nodesByLevel.get(node.level) || [];
    levelNodes.push(node);
    nodesByLevel.set(node.level, levelNodes);
  }

  // Calculate positions for each node
  const levelOrder = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);

  for (const level of levelOrder) {
    const levelNodes = nodesByLevel.get(level) || [];
    const levelY = level * LEVEL_HEIGHT;

    levelNodes.forEach((node, index) => {
      const totalNodesInLevel = levelNodes.length;
      const spacing = 300;
      const offsetX = ((totalNodesInLevel - 1) * spacing) / 2;
      const x = index * spacing - offsetX;

      // Find incoming edges to this node to calculate total count
      const incomingEdges = data.edges.filter((e) =>
        direction === "forward" ? e.to === node.id : e.from === node.id
      );
      const totalCount = incomingEdges.reduce((sum, e) => sum + e.count, 0);

      nodes.push({
        id: node.id,
        type: node.isAggregate ? "default" : "transitionNode",
        position: { x, y: levelY },
        data: {
          label: node.key,
          count: totalCount,
          level: node.level,
          isAggregate: node.isAggregate,
          isAnchor: node.level === 0,
        },
        style: {
          width: NODE_WIDTH,
        },
      });
    });
  }

  // Create edges with varying widths based on percentage
  for (const edge of data.edges) {
    const strokeWidth = Math.max(2, Math.min(10, edge.percentage / 10));
    const isWeak = edge.percentage < 10;

    edges.push({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: "smoothstep",
      animated: !edge.isAggregate && edge.percentage > 30,
      style: {
        strokeWidth,
        stroke: edge.isAggregate
          ? "#999"
          : isWeak
            ? "#e0e0e0"
            : `hsl(${220 - edge.percentage}, 70%, 50%)`,
      },
      label: edge.isAggregate ? undefined : `${edge.percentage.toFixed(1)}%`,
      labelStyle: {
        fontSize: 11,
        fill: "#666",
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: "#fff",
        fillOpacity: 0.8,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.isAggregate
          ? "#999"
          : isWeak
            ? "#e0e0e0"
            : `hsl(${220 - edge.percentage}, 70%, 50%)`,
      },
      data: {
        count: edge.count,
        percentage: edge.percentage,
        avgDurationMs: edge.avgDurationMs,
      },
    });
  }

  return { nodes, edges };
}

export function TransitionFlowContent({
  data,
  isLoading,
  direction,
}: TransitionFlowContentProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = transformDataToReactFlow(
        data,
        direction
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data, direction, setNodes, setEdges]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      minZoom={0.1}
      maxZoom={1.5}
    >
      <Background />
      <Controls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
    </ReactFlow>
  );
}
