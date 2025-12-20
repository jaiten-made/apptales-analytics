import { ListItem, ListItemText } from "@mui/material";
import React from "react";
import { Handle, type NodeProps, Position } from "reactflow";

export const StepNode: React.FC<
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
        position={Position.Left}
        className="w-2 h-2 bg-emerald-700 border-2 border-white rounded-full !-left-1"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-emerald-700 border-2 border-white rounded-full !-right-1"
      />
    </div>
  );
};
