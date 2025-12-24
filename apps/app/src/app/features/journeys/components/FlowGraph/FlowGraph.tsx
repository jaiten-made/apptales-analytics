import { Box, colors, Typography } from "@mui/material";
import { IconFilter } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import type { NodeMouseHandler } from "reactflow";
import ReactFlow, { Background, BackgroundVariant, Controls } from "reactflow";
import "reactflow/dist/style.css";
import theme from "../../../../../lib/mui/theme";
import { useGetPathExplorationQuery } from "../../../../../lib/redux/api/projects/project/project";
import { buildGraph } from "./buildGraph";
import StartingPointSelector from "./StartingPointSelector";
import { StepHeaderNode } from "./StepHeaderNode";
import { StepNode } from "./StepNode";

const FlowGraph: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [startingEventKey, setStartingEventKey] = useState<string | null>(null);

  const {
    data: graph,
    isLoading,
    error,
  } = useGetPathExplorationQuery(
    {
      projectId,
      startingEventKey: startingEventKey || undefined,
    },
    {
      skip: !startingEventKey, // Only fetch when a starting point is selected
    }
  );

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
    []
  );

  // Show empty state when no starting point is selected
  if (!startingEventKey) {
    return (
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        {/* Filter Controls */}
        <Box
          p={2}
          borderBottom={1}
          borderColor="divider"
          bgcolor="background.paper"
        >
          <StartingPointSelector
            projectId={projectId}
            selectedEventKey={startingEventKey}
            onEventKeyChange={setStartingEventKey}
          />
        </Box>

        {/* Empty State */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          bgcolor="gray.50"
        >
          <IconFilter size={64} stroke={1.5} color="#9ca3af" />
          <Typography variant="h6" color="text.secondary">
            Select a Starting Point
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
            Choose an event from the dropdown above to see the user journey paths
            that begin with that event.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box
          p={2}
          borderBottom={1}
          borderColor="divider"
          bgcolor="background.paper"
        >
          <StartingPointSelector
            projectId={projectId}
            selectedEventKey={startingEventKey}
            onEventKeyChange={setStartingEventKey}
          />
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <Typography>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !graph) {
    return (
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box
          p={2}
          borderBottom={1}
          borderColor="divider"
          bgcolor="background.paper"
        >
          <StartingPointSelector
            projectId={projectId}
            selectedEventKey={startingEventKey}
            onEventKeyChange={setStartingEventKey}
          />
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <Typography color="error">Error loading flow graph</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" width="100%">
      {/* Filter Controls */}
      <Box
        p={2}
        borderBottom={1}
        borderColor="divider"
        bgcolor="background.paper"
      >
        <StartingPointSelector
          projectId={projectId}
          selectedEventKey={startingEventKey}
          onEventKeyChange={setStartingEventKey}
        />
      </Box>

      {/* Flow Graph */}
      <Box flex={1} bgcolor="gray.50">
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
      </Box>
    </Box>
  );
};

export default FlowGraph;
