import React, { useCallback, useEffect, useState } from "react";
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
import data from "./data.json";

const FlowGraph: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    // Load nodes/edges from data.json with explicit types
    type JsonNode = {
      id: string | number;
      type?: string;
      data: { label: string };
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

    const loadedNodes: Node[] = json.nodes.map((n) => ({
      id: String(n.id),
      position: n.position,
      data: {
        label: (
          <div>
            {String(n.data.label)
              .split("\n")
              .map((s, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                  {s}
                </div>
              ))}
          </div>
        ),
      },
      style: (n.style as Record<string, unknown>) || {
        width: 300,
        padding: 12,
      },
    }));

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
