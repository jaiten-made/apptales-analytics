import { colors } from "@mui/material";
import { type Edge, type Node, Position } from "reactflow";
import type { TransitionGraph } from "../../../../../lib/redux/api/projects/project/project";

export function buildTransitionGraph(data: TransitionGraph) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group nodes by step for positioning
  const nodesByStep = new Map<number, typeof data.nodes>();
  data.nodes.forEach((node) => {
    if (!nodesByStep.has(node.level)) {
      nodesByStep.set(node.level, []);
    }
    nodesByStep.get(node.level)!.push(node);
  });

  // Layout constants
  const gapX = 400; // Horizontal spacing between steps
  const gapY = 200; // Vertical spacing between nodes in same step
  const startY = 100;

  // Position nodes
  nodesByStep.forEach((stepNodes, step) => {
    const x = step * gapX;

    // Sort by count (most common at top)
    stepNodes.sort((a, b) => b.count - a.count);

    stepNodes.forEach((node, index) => {
      const y = startY + index * gapY;

      nodes.push({
        id: node.id,
        type: "stepNode",
        position: { x, y },
        data: {
          label: node.key,
          count: node.count,
          isAggregate: node.isAggregate,
          isStart: step === 0,
          event_type: node.key.split(":")[0],
          event_name: node.key.split(":")[1] || node.key,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          width: 200,
          background: "transparent",
          border: "none",
        },
      });
    });

    // Add step header
    nodes.push({
      id: `header_step_${step}`,
      type: "stepHeader",
      position: { x, y: 0 },
      data: { label: `Step ${step}` },
      draggable: false,
      selectable: false,
      style: { width: 200, background: "transparent", border: "none" },
    });

    // Add step group box
    const columnHeight = startY + Math.max(stepNodes.length, 1) * gapY - 50;
    nodes.push({
      id: `box_step_${step}`,
      data: { label: null },
      position: { x: x - 25, y: -30 },
      type: "group",
      draggable: false,
      selectable: false,
      zIndex: -10,
      style: {
        width: 250,
        height: columnHeight,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        border: "1px dashed #cbd5e1",
        borderRadius: "16px",
        pointerEvents: "none",
      },
    });
  });

  // Create edges with styling based on count (Sankey-like)
  data.edges.forEach((edge) => {
    // Calculate stroke width proportional to count
    const minStroke = 2;
    const maxStroke = 16;
    const allCounts = data.edges.map((e) => e.count);
    const minCount = Math.min(...allCounts);
    const maxCount = Math.max(...allCounts);

    const strokeWidth =
      minCount === maxCount
        ? minStroke
        : minStroke +
          ((edge.count - minCount) / (maxCount - minCount)) *
            (maxStroke - minStroke);

    edges.push({
      id: `e_${edge.from}_${edge.to}`,
      source: edge.from,
      target: edge.to,
      style: { strokeWidth, stroke: colors.grey[500] },
    });
  });

  return { nodes, edges };
}
