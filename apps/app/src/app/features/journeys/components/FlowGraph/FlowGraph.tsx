import { intervalToDuration } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
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
import CustomListNode from "./CustomListNode";
import data from "./data.json";
// Journey list (table) data includes status for each journey id
import journeys from "../DataTable/data.json";
// User journey attempts data (per journey) includes status per attempt
import userJourneyAttempts from "../details/data.json";

// Types for imported static JSON (mock data)
interface JourneyRow {
  id: string | number;
  status?: string;
}

interface UserJourneyAttemptRow {
  id: string | number;
  journeyId?: string | number;
  status?: string;
}

const FlowGraph: React.FC = () => {
  const nodeTypes = { listNode: CustomListNode };
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // read route params: /journeys/:id/user-journey/:userId?
  const { id: journeyId, userId } = useParams();

  // Determine overall status priority order (user journey attempt first, then journey)
  const overallStatus = useMemo(() => {
    // try to find user attempt status if userId present
    if (userId) {
      const attempt = (userJourneyAttempts as UserJourneyAttemptRow[]).find(
        (a) =>
          String(a.id) === String(userId) &&
          (journeyId ? String(a.journeyId) === String(journeyId) : true)
      );
      if (attempt?.status) return String(attempt.status).toLowerCase();
    }
    // otherwise fall back to journey level status
    if (journeyId) {
      const journey = (journeys as JourneyRow[]).find(
        (j) => String(j.id) === String(journeyId)
      );
      if (journey?.status) return String(journey.status).toLowerCase();
    }
    return undefined;
  }, [journeyId, userId]);

  // Build nodes/edges whenever overallStatus changes so we can override node completion state.
  useEffect(() => {
    // Load nodes/edges from data.json with explicit types
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
      // If overall status is success, force all nodes completed (green)
      const isCompleted =
        overallStatus === "success"
          ? true
          : Boolean(jsonNode.data?.hasCompleted);

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

    // Helper to format milliseconds to human-readable string using date-fns
    const formatDuration = (ms: unknown) => {
      if (ms == null) return "";
      const n = Number(ms);
      if (!isFinite(n) || n <= 0) return "";
      // For values below 1000ms, keep ms precision
      if (n < 1000) return `${n}ms`;

      const secondsTotal = Math.floor(n / 1000);
      const duration = intervalToDuration({
        start: 0,
        end: secondsTotal * 1000,
      });

      // Use only minutes and seconds if present, otherwise seconds
      const parts: Record<string, number> = {
        years: duration.years || 0,
        months: duration.months || 0,
        days: duration.days || 0,
        hours: duration.hours || 0,
        minutes: duration.minutes || 0,
        seconds: duration.seconds || 0,
      };

      // Produce a short string like '1m 12s' or '2h 3m' depending on magnitude
      const tokens: string[] = [];
      if (parts.years) tokens.push(`${parts.years}y`);
      if (parts.months) tokens.push(`${parts.months}mo`);
      if (parts.days) tokens.push(`${parts.days}d`);
      if (parts.hours) tokens.push(`${parts.hours}h`);
      if (parts.minutes) tokens.push(`${parts.minutes}m`);
      if (parts.seconds || tokens.length === 0)
        tokens.push(`${parts.seconds}s`);

      return tokens.join(" ");
    };

    // Build edges and attach a duration label (from target node's durationMs)
    const loadedEdges: Edge[] = json.edges.map((e) => {
      const targetNode = json.nodes.find(
        (n) => String(n.id) === String(e.target)
      );
      const durationLabel = targetNode
        ? formatDuration(targetNode.data?.durationMs)
        : "";
      const edge: Edge = {
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
        animated: Boolean(e.animated),
        label: durationLabel || undefined,
        labelStyle: durationLabel
          ? { fontSize: 12, fill: "#222", background: "transparent" }
          : undefined,
      };
      return edge;
    });

    setNodes(loadedNodes);
    setEdges(loadedEdges);
  }, [overallStatus]);

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
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default FlowGraph;
