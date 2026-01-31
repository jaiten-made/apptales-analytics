import { theme } from "@apptales/mui-config";
import { Box, colors, Typography } from "@mui/material";
import { IconFilter } from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";
import type { NodeMouseHandler } from "reactflow";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGetTransitionsQuery } from "../../../../../lib/redux/api/projects/project/project";
import { EventDiscoveryPanel } from "../../../shared/components/EventDiscoveryPanel";
import { buildTransitionGraph } from "./buildTransitionGraph";
import { StepHeaderNode } from "./StepHeaderNode";
import { StepNode } from "./StepNode";

// Component that uses useReactFlow hook - must be inside ReactFlowProvider
const FocusOnMount: React.FC<{ nodes: any[] }> = ({ nodes }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodes.length > 0) {
      // Find level 0 nodes (anchor/starting nodes)
      const level0Nodes = nodes.filter(
        (node) => node.data?.isStart && node.type === "stepNode",
      );

      if (level0Nodes.length > 0) {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          fitView({
            nodes: level0Nodes,
            padding: 0.5,
            duration: 800,
            minZoom: 0.8,
            maxZoom: 1.2,
          });
        }, 100);
      }
    }
  }, [nodes, fitView]);

  return null;
};

const FlowGraphContent: React.FC<{
  projectId: string;
  startingEventId: string;
  onEventSelect: (eventId: string, eventKey: string) => void;
}> = ({ projectId, startingEventId, onEventSelect }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const {
    data: graph,
    isLoading,
    error,
  } = useGetTransitionsQuery({
    projectId,
    anchorEventId: startingEventId,
    direction: "forward",
    topN: 5,
    depth: 3,
  });

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (graph ? buildTransitionGraph(graph) : { nodes: [], edges: [] }),
    [graph],
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
        dimmed:
          selectedNodeId !== null &&
          !connectedNodeIds.has(node.id) &&
          node.type !== "stepHeader",
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
    if (node.type === "stepHeader") return;
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

  // register custom node
  const nodeTypes = useMemo(
    () => ({ stepNode: StepNode, stepHeader: StepHeaderNode }),
    [],
  );

  // Render content based on state
  let content: React.ReactNode = null;

  if (isLoading) {
    content = null; // Just show the drawer
  } else if (error || !graph) {
    content = (
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Typography color="error">Error loading flow graph</Typography>
      </Box>
    );
  } else {
    content = (
      <Box flex={1} bgcolor="gray.50" height="100%" position="relative">
        {/* cursor overrides */}
        <style>{`
        .rfCustomCursor .react-flow__pane { cursor: default !important; }
        .rfCustomCursor .react-flow__pane.dragging { cursor: grabbing !important; }
        /* optional: make nodes look clickable */
        .rfCustomCursor .react-flow__node { cursor: pointer; }
        .rfCustomCursor .react-flow__node-stepHeader { cursor: default !important; }
      `}</style>
        <ReactFlowProvider>
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
            <FocusOnMount nodes={initialNodes} />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    );
  }

  // Common layout wrapper with EventDiscoveryPanel
  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      overflow="hidden"
      position="relative"
    >
      <EventDiscoveryPanel
        projectId={projectId}
        selectedEventId={startingEventId}
        onEventSelect={onEventSelect}
        open
      />
      {content}
    </Box>
  );
};

const FlowGraph: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [startingEventId, setStartingEventId] = useState<string | null>(null);

  const handleEventSelect = (eventId: string, _eventKey: string) => {
    setStartingEventId(eventId);
  };

  // Show empty state when no starting point is selected
  if (!startingEventId) {
    return (
      <Box
        display="flex"
        height="100%"
        width="100%"
        overflow="hidden"
        position="relative"
      >
        <EventDiscoveryPanel
          projectId={projectId}
          selectedEventId={startingEventId}
          onEventSelect={handleEventSelect}
          open
        />

        {/* Empty State */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          bgcolor="gray.50"
          position="relative"
        >
          <IconFilter size={64} stroke={1.5} color="#9ca3af" />
          <Typography variant="h6" color="text.secondary">
            Select an Anchor Event
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            maxWidth={400}
          >
            Pick an event from the left panel to visualize user journey flows
            and discover the most common paths users take through your product.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <FlowGraphContent
      projectId={projectId}
      startingEventId={startingEventId}
      onEventSelect={handleEventSelect}
    />
  );
};

export default FlowGraph;
