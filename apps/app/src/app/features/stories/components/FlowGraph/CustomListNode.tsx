import {
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import clsx from "clsx";
import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

type Data = {
  title: string;
  lines?: string[];
  hasCompleted?: boolean;
};

const CustomListNode: React.FC<NodeProps<Data>> = ({ data, id }) => {
  const { title, lines = [], hasCompleted } = data || {};

  return (
    <Box
      className={clsx(
        "w-full relative flex items-center p-2 pointer-events-auto bg-white outline",
        hasCompleted ? " outline-green-500" : "outline-red-500"
      )}
      data-node-id={id}
    >
      {/* target (incoming) handle on left */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
        id="a"
      />

      <ListItem disableGutters className="w-full">
        <ListItemAvatar>
          <Avatar
            className={clsx(
              "w-10 h-10 text-white",
              hasCompleted ? "bg-green-500" : "bg-gray-400"
            )}
          >
            <IconCheck size={18} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={title}
          secondary={lines.length > 0 ? lines.join("\n") : undefined}
          primaryTypographyProps={{
            component: "div",
            className: "whitespace-pre-wrap",
          }}
          secondaryTypographyProps={{
            component: "div",
            className: "whitespace-pre-wrap",
          }}
        />
      </ListItem>

      {/* source (outgoing) handle on right */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
        id="b"
      />
    </Box>
  );
};

export default CustomListNode;
