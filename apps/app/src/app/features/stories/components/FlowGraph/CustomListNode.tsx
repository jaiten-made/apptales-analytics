import {
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
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
      sx={{
        width: "100%",
        position: "relative", // important so Handles are positioned correctly
        display: "flex",
        alignItems: "center",
        padding: 2,
        pointerEvents: "auto",
        outline: "red solid 1px",
      }}
      data-node-id={id}
    >
      {/* target (incoming) handle on left */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
        id="a"
      />

      <ListItem disableGutters sx={{ width: "100%" }}>
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: hasCompleted ? "success.main" : "grey.400",
              width: 40,
              height: 40,
            }}
          >
            <IconCheck size={18} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={title}
          secondary={lines.length > 0 ? lines.join("\n") : undefined}
          primaryTypographyProps={{
            component: "div",
            style: { whiteSpace: "pre-wrap" },
          }}
          secondaryTypographyProps={{
            component: "div",
            style: { whiteSpace: "pre-wrap" },
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
