import React, { useCallback, useEffect, useState } from "react";
import type { Connection, Edge, OnEdgesChange, OnNodesChange } from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomListNode from "./CustomListNode";
import data from "./data.json";

const FlowGraph: React.FC = () => {
  const nodeTypes = { listNode: CustomListNode };
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    // Load nodes/edges from data.json with explicit types
    type JsonNode = {
      id: string | number;
      type?: string;
      data: { label: string; hasCompleted?: boolean };
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
    };

    const json = data as unknown as FlowJson;

    // Helper to parse padding (number or "12px")
    const parsePadding = (p?: unknown) => {
      if (typeof p === "number") return p;
      if (typeof p === "string") {
        const m = p.match(/^(\d+)/);
        return m ? Number(m[1]) : 0;
      }
      return 0;
    };

    // Measure text height in the DOM (runs in browser inside useEffect)
    const measureTextHeight = (text: string, width: number) => {
      try {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.visibility = "hidden";
        el.style.width = `${width}px`;
        el.style.whiteSpace = "pre-wrap";
        el.style.font = "inherit";
        el.style.lineHeight = "normal";
        el.innerText = text;
        document.body.appendChild(el);
        const h = el.offsetHeight;
        document.body.removeChild(el);
        return h;
      } catch {
        // SSR fallback
        return 0;
      }
    };

    const elementGap = 128; // desired gap between elements

    // Build nodes with measured heights and compute new vertical positions so gaps are equal
    // sort nodes by original y so layout remains stable
    const nodesWithMeta = json.nodes
      .map((n, idx) => ({ n, idx }))
      .sort((a, b) => a.n.position.y - b.n.position.y);

    let currentY = 0;
    const loadedNodes: Node[] = nodesWithMeta.map(({ n }) => {
      const width = (n.style?.width as number) || 300;
      const padding = parsePadding(n.style?.padding ?? 12);
      // measure the label text height (exclude padding)
      const labelText = String(n.data.label);
      const measured = measureTextHeight(
        labelText,
        Math.max(20, width - padding * 2)
      );
      const totalHeight = measured + padding * 2;

      const jsonNode = n as JsonNode;
      const isCompleted = Boolean(jsonNode.data?.hasCompleted);

      const node: Node = {
        id: String(n.id),
        position: { x: n.position.x, y: currentY },
        type: "listNode",
        data: {
          title: labelText.split("\n")[0] ?? "",
          lines: labelText.split("\n").slice(1),
          hasCompleted: isCompleted,
        },
        style: {
          ...((n.style as Record<string, unknown>) || {}),
          width,
          padding,
          height: totalHeight, // dynamic height based on content
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
      };

      // advance currentY by this node's height + desired gap
      currentY += totalHeight + elementGap;
      return node;
    });

    const loadedEdges: Edge[] = json.edges.map((e) => ({
      id: String(e.id),
      source: String(e.source),
      target: String(e.target),
      animated: Boolean(e.animated),
    }));

    setNodes(loadedNodes);
    setEdges(loadedEdges);
  }, []);

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

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default FlowGraph;
