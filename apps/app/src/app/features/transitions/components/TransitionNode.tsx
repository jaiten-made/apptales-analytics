import { Box, Chip, Paper, Typography } from "@mui/material";
import { memo } from "react";
import { Handle, Position } from "reactflow";

interface TransitionNodeProps {
  data: {
    label: string;
    count: number;
    level: number;
    isAggregate?: boolean;
    isAnchor?: boolean;
  };
}

export const TransitionNode = memo(({ data }: TransitionNodeProps) => {
  const { label, count, isAnchor, isAggregate } = data;

  return (
    <Paper
      elevation={isAnchor ? 8 : 3}
      sx={{
        p: 2,
        minWidth: 200,
        borderLeft: isAnchor ? 4 : 0,
        borderColor: "primary.main",
        bgcolor: isAnchor
          ? "primary.50"
          : isAggregate
            ? "grey.100"
            : "background.paper",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          width: 8,
          height: 8,
        }}
      />

      <Box>
        {isAnchor && (
          <Chip
            label="ANCHOR"
            size="small"
            color="primary"
            sx={{ mb: 1, fontSize: 10, height: 20 }}
          />
        )}

        <Typography
          variant="body2"
          fontWeight={isAnchor ? 600 : 500}
          sx={{
            wordBreak: "break-word",
            color: isAggregate ? "text.secondary" : "text.primary",
          }}
        >
          {label}
        </Typography>

        {count > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {count.toLocaleString()} sessions
            </Typography>
          </Box>
        )}
      </Box>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          width: 8,
          height: 8,
        }}
      />
    </Paper>
  );
});

TransitionNode.displayName = "TransitionNode";
