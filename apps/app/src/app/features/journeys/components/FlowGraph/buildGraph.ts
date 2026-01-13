import { type FlowGraph as FlowGraphType } from "@apptales/types";
import { colors } from "@mui/material";
import { type Edge, type Node, Position } from "reactflow";

export function buildGraph(data: FlowGraphType) {
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
    // Sort events by count descending
    events.sort((a, b) => b.count - a.count);

    const gapX = 400; // Horizontal spacing between steps
    const gapY = 200; // Vertical spacing between events
    const startY = 100; // Initial Y offset below header

    // Add Column Box
    const columnHeight = startY + Math.max(events.length, 1) * gapY - 50;

    nodes.push({
      id: `box_step_${step}`,
      data: { label: null },
      position: { x: (step - 1) * gapX - 25, y: -30 },
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

    // Add Step Header
    nodes.push({
      id: `header_step_${step}`,
      type: "stepHeader",
      data: { label: `Step ${step}` },
      position: { x: (step - 1) * gapX, y: 0 },
      draggable: false,
      selectable: false,
      style: { width: 200, background: "transparent", border: "none" }, // Match card width
    });

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
        // Horizontal layout: X depends on step, Y depends on index
        position: { x: (step - 1) * gapX, y: startY + idx * gapY },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
