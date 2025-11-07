import { type FlowGraph as FlowGraphType } from "@apptales/events-schema";
import { colors, ListItem, ListItemText } from "@mui/material";
import React, { useMemo, useState } from "react";
import type { Edge, Node, NodeMouseHandler, NodeProps } from "reactflow";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import theme from "../../../../../lib/mui/theme";
import { useGetPathExplorationQuery } from "../../../../../lib/redux/api/projects/project/project";

// Build nodes and edges from new mock data
function buildGraph(data: FlowGraphType) {
  // Group events by step
  const steps = new Map<
    number,
    {
      id: string;
      label: string;
      event_type: string;
      event_name: string;
      count: number;
      exits?: number;
    }[]
  >();
  data.forEach((item) => {
    const id = `step${item.step}_${item.event.key}`;
    if (!steps.has(item.step)) steps.set(item.step, []);
    steps.get(item.step)!.push({
      id,
      label: item.event.key,
      event_type: item.event.type,
      event_name: item.event.name,
      count: item.count,
      exits: item.exits,
    });
  });

  // Build nodes
  const nodes: Node[] = [];
  steps.forEach((events, step) => {
    const gapX = 240;
    const baseX = -((events.length - 1) * gapX) / 2; // center row around x=0
    events.forEach((event, idx) => {
      nodes.push({
        id: event.id,
        type: "stepNode",
        data: {
          label: event.label,
          event_type: event.event_type,
          event_name: event.event_name,
          count: event.count,
          exits: event.exits,
        },
        position: { x: baseX + gapX * idx, y: 175 * (step - 1) },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          // let the custom node style dominate
          width: 200,
          background: "transparent",
          border: "none",
        },
      });
    });
  });

  // Build edges: connect every event in step N to every event in step N+1
  const edges: Edge[] = [];
  const stepNumbers = Array.from(steps.keys()).sort((a, b) => a - b);
  for (let i = 0; i < stepNumbers.length - 1; i++) {
    const fromEvents = steps.get(stepNumbers[i])!;
    const toEvents = steps.get(stepNumbers[i + 1])!;
    fromEvents.forEach((from) => {
      toEvents.forEach((to) => {
        // Sankey-like: strokeWidth proportional to source count
        const minStroke = 2;
        const maxStroke = 16;
        const minCount = Math.min(...data.map((d) => d.count));
        const maxCount = Math.max(...data.map((d) => d.count));
        // Normalize stroke width
        const strokeWidth =
          minCount === maxCount
            ? minStroke
            : minStroke +
              ((from.count - minCount) / (maxCount - minCount)) *
                (maxStroke - minStroke);

        edges.push({
          id: `e_${from.id}_${to.id}`,
          source: from.id,
          target: to.id,
          style: { strokeWidth, stroke: colors.grey[500] },
        });
      });
    });
  }

  return { nodes, edges };
}

// Custom Node that visually matches the screenshot using Tailwind
const StepNode: React.FC<
  NodeProps<{
    label: string;
    event_type: string;
    event_name: string;
    count: number;
    exits?: number;
    percent: number;
    isStart?: boolean;
    selected?: boolean;
    dimmed?: boolean;
  }>
> = ({ data }) => {
  const exitRate =
    data.exits !== undefined
      ? ((data.exits / data.count) * 100).toFixed(1)
      : undefined;

  return (
    <div
      className={[
        "relative w-[200px] bg-white border border-gray-300 rounded-lg",
        "shadow-inner text-neutral-900 text-[12px] leading-[1.2]",
        "transition-opacity duration-200",
        data.selected ? "ring-2 ring-blue-500/30" : "",
        data.dimmed ? "opacity-25" : "opacity-100",
      ].join(" ")}
    >
      {data.isStart ? (
        <div className="absolute -top-3 left-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide">
          START
        </div>
      ) : null}

      <ListItem sx={{ px: 1, py: 0.5 }}>
        <ListItemText
          primary={data.event_name}
          secondary={data.event_type}
          slotProps={{
            primary: {
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
              noWrap: true,
            },
            secondary: {
              fontSize: "10px",
              textAlign: "center",
              noWrap: true,
            },
          }}
        />
      </ListItem>

      <div className="flex flex-row border-t border-gray-200 px-2 py-2">
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="text-[10px] text-gray-500">Events</div>
          <div className="font-semibold text-xs">{data.count}</div>
        </div>
        {data.exits !== undefined && (
          <>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="text-[10px] text-gray-500">Exits</div>
              <div className="font-semibold text-xs">{data.exits}</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="text-[10px] text-gray-500">Rate</div>
              <div className=" font-semibold text-xs">{exitRate}%</div>
            </div>
          </>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-emerald-700 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-emerald-700 border-2 border-white rounded-full"
      />
    </div>
  );
};

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
        dimmed: selectedNodeId !== null && !connectedNodeIds.has(node.id),
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
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

  // register custom node
  const nodeTypes = useMemo(() => ({ stepNode: StepNode }), []);

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
