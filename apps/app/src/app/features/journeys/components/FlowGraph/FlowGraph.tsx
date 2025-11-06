import { colors } from "@mui/material";
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

// New mock data
const mockData = [
  { step: 1, event_key: "page_view:/home", count: 50 },
  { step: 2, event_key: "click:view_product_button", count: 20 },
  { step: 2, event_key: "click:learn_more_button", count: 18, exits: 3 },
  { step: 2, event_key: "click:read_more_button", count: 12, exits: 5 },
  { step: 3, event_key: "page_view:/products", count: 22 },
  { step: 3, event_key: "page_view:/about", count: 19, exits: 4 },
  { step: 3, event_key: "page_view:/blog", count: 13, exits: 2 },
  { step: 4, event_key: "click:buy_now_button", count: 21 },
  { step: 4, event_key: "click:view_product_button", count: 17, exits: 3 },
  { step: 4, event_key: "click:generic", count: 11, exits: 4 },
  { step: 5, event_key: "page_view:/products", count: 23 },
  { step: 5, event_key: "page_view:/pricing", count: 20, exits: 2 },
  { step: 5, event_key: "page_view:/services", count: 14, exits: 3 },
  { step: 6, event_key: "click:buy_now_button", count: 19 },
  { step: 6, event_key: "click:signup_button", count: 15, exits: 4 },
  { step: 6, event_key: "click:submit_button", count: 13, exits: 3 },
  { step: 7, event_key: "page_view:/checkout", count: 18, exits: 5 },
  { step: 7, event_key: "page_view:/contact", count: 16, exits: 2 },
  { step: 7, event_key: "page_view:/pricing", count: 14, exits: 3 },
  { step: 8, event_key: "click:submit_button", count: 17, exits: 6 },
  { step: 8, event_key: "click:signup_button", count: 15, exits: 4 },
  { step: 9, event_key: "page_view:/thank-you", count: 16 },
  { step: 9, event_key: "page_view:/checkout", count: 13, exits: 7 },
];

// Build nodes and edges from new mock data
function buildGraph(data: typeof mockData) {
  // Group events by step
  const steps = new Map<
    number,
    { id: string; label: string; count: number; exits?: number }[]
  >();
  data.forEach((item) => {
    const id = `step${item.step}_${item.event_key}`;
    if (!steps.has(item.step)) steps.set(item.step, []);
    steps.get(item.step)!.push({
      id,
      label: item.event_key,
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
        const minCount = Math.min(...mockData.map((d) => d.count));
        const maxCount = Math.max(...mockData.map((d) => d.count));
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

      <div className="text-center px-2.5 pt-2 pb-1 font-semibold text-neutral-800 truncate">
        {data.label}
      </div>

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

const { nodes: initialNodes, edges: initialEdges } = buildGraph(mockData);

const FlowGraph: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
  }, [selectedNodeId]);

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
  }, [selectedNodeId]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

  // register custom node
  const nodeTypes = useMemo(() => ({ stepNode: StepNode }), []);

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
