import React, { useMemo, useState } from "react";
import type { Edge, Node, NodeMouseHandler } from "reactflow";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// New mock data
const mockData = [
  { step: 1, event_key: "page_view:/home", count: 50 },
  { step: 2, event_key: "click:view_product_button", count: 20 },
  { step: 2, event_key: "click:learn_more_button", count: 18 },
  { step: 2, event_key: "click:read_more_button", count: 12 },
  { step: 3, event_key: "page_view:/products", count: 22 },
  { step: 3, event_key: "page_view:/about", count: 19 },
  { step: 3, event_key: "page_view:/blog", count: 13 },
  { step: 4, event_key: "click:buy_now_button", count: 21 },
  { step: 4, event_key: "click:view_product_button", count: 17 },
  { step: 4, event_key: "click:generic", count: 11 },
  { step: 5, event_key: "page_view:/products", count: 23 },
  { step: 5, event_key: "page_view:/pricing", count: 20 },
  { step: 5, event_key: "page_view:/services", count: 14 },
  { step: 6, event_key: "click:buy_now_button", count: 19 },
  { step: 6, event_key: "click:signup_button", count: 15 },
  { step: 6, event_key: "click:submit_button", count: 13 },
  { step: 7, event_key: "page_view:/checkout", count: 18 },
  { step: 7, event_key: "page_view:/contact", count: 16 },
  { step: 7, event_key: "page_view:/pricing", count: 14 },
  { step: 8, event_key: "click:submit_button", count: 17 },
  { step: 8, event_key: "click:signup_button", count: 15 },
  { step: 9, event_key: "page_view:/thank-you", count: 16 },
  { step: 9, event_key: "page_view:/checkout", count: 13 },
];

// Build nodes and edges from new mock data
function buildGraph(data: typeof mockData) {
  // Group events by step
  const steps = new Map<
    number,
    { id: string; label: string; count: number }[]
  >();
  data.forEach((item) => {
    const id = `step${item.step}_${item.event_key}`;
    if (!steps.has(item.step)) steps.set(item.step, []);
    steps
      .get(item.step)!
      .push({ id, label: item.event_key, count: item.count });
  });

  // Build nodes
  const nodes: Node[] = [];
  steps.forEach((events, step) => {
    const gapX = 240;
    const baseX = -((events.length - 1) * gapX) / 2; // center row around x=0
    events.forEach((event, idx) => {
      nodes.push({
        id: event.id,
        data: { label: `${event.label} (${event.count})` },
        // Vertical layout: steps on y, events on x (centered)
        position: { x: baseX + gapX * idx, y: 120 * (step - 1) },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          width: 200,
          height: 40,
          borderRadius: 8,
          background: "#fff",
          border: "1px solid #bbb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          animated: false,
          style: { strokeWidth, stroke: "#1976d2" },
        });
      });
    });
  }

  return { nodes, edges };
}

const { nodes: initialNodes, edges: initialEdges } = buildGraph(mockData);

const FlowGraph: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Memoize nodes to add selection style
  const nodes = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        border:
          node.id === selectedNodeId ? "2px solid #1976d2" : node.style?.border,
        boxShadow:
          node.id === selectedNodeId ? "0 0 0 2px #1976d233" : undefined,
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
          stroke: isAttached ? "#ff9800" : edge.style?.stroke,
          opacity: isAttached ? 1 : 0.4,
        },
      };
    });
  }, [selectedNodeId]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

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
