import { colors } from "@mui/material";
import React, { useMemo, useState } from "react";
import type { NodeMouseHandler } from "reactflow";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import theme from "../../../../../lib/mui/theme";
import { useGetPathExplorationQuery } from "../../../../../lib/redux/api/projects/project/project";
import { buildGraph } from "./buildGraph";
import { StepHeaderNode } from "./StepHeaderNode";
import { StepNode } from "./StepNode";

const FlowGraph: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const {
    data: graph,
    isLoading,
    error,
  } = useGetPathExplorationQuery(projectId);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (graph ? buildGraph(graph) : { nodes: [], edges: [] }),
    [graph]
  );

  // Memoize nodes and pass selection via data (no inline styles)
  const nodes = useMemo(() => {
    // Find connected node IDs if a node is selected
    const connectedNodeIds = new Set<string>();
    if (selectedNodeId) {
      connectedNodeIds.add(selectedNodeId);
      initialEdges.forEach((edge) => {
        if (edge.source === selectedNodeId) {
          connectedNodeIds.add(edge.target);
        }
        if (edge.target === selectedNodeId) {
          connectedNodeIds.add(edge.source);
        }
      });
    }

    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        selected: node.id === selectedNodeId,
        dimmed: selectedNodeId !== null && !connectedNodeIds.has(node.id) && node.type !== 'stepHeader',
      },
    }));
  }, [initialEdges, initialNodes, selectedNodeId]);

  // Memoize edges to highlight attached ones
  const edges = useMemo(() => {
    if (!selectedNodeId) return initialEdges;
    return initialEdges.map((edge) => {
      const isAttached =
        edge.source === selectedNodeId || edge.target === selectedNodeId;
      return {
        ...edge,
        style: {
          ...edge.style,
          stroke: isAttached ? theme.palette.primary.main : colors.grey[400],
          opacity: isAttached ? 1 : 0.35,
        },
      };
    });
  }, [initialEdges, selectedNodeId]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = (_, node) => {
    // Ignore header clicks
    if (node.type === 'stepHeader') return;
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

  // register custom node
  const nodeTypes = useMemo(() => ({ stepNode: StepNode, stepHeader: StepHeaderNode }), []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Error loading flow graph
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 bg-gray-50">
        {/* cursor overrides */}
        <style>{`
        .rfCustomCursor .react-flow__pane { cursor: default !important; }
        .rfCustomCursor .react-flow__pane.dragging { cursor: grabbing !important; }
        /* optional: make nodes look clickable */
        .rfCustomCursor .react-flow__node { cursor: pointer; }
        .rfCustomCursor .react-flow__node-stepHeader { cursor: default !important; }
      `}</style>
        <ReactFlow
          className="rfCustomCursor"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
          nodesDraggable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={2}
          onNodeClick={onNodeClick}
          panOnDrag={[1]}
          zoomOnPinch={true}
          onPaneClick={() => setSelectedNodeId(null)}
        >
          <Controls showInteractive={false} />
          <Background variant={BackgroundVariant.Dots} gap={24} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowGraph;
