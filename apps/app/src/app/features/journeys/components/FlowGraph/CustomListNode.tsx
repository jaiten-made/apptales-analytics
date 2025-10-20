import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconArrowsShuffle, IconTrendingDown } from "@tabler/icons-react";
import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

type Data = {
  title: string;
  lines?: string[];
  hasCompleted?: boolean;
  isStartNode?: boolean;
  allNodeIds?: string[];
  allNodeLabels?: Record<string, string>;
  onChangeStartNode?: (id: string) => void;
  userCount?: number;
  percentage?: number;
  dropOffRate?: number;
  totalUsers?: number;
};

const CustomListNode: React.FC<NodeProps<Data>> = ({ data, id }) => {
  const {
    title,
    lines = [],
    hasCompleted,
    isStartNode,
    allNodeIds,
    allNodeLabels,
    onChangeStartNode,
    userCount = 0,
    percentage = 0,
    dropOffRate = 0,
    totalUsers,
  } = data || {};
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Determine color based on completion and drop-off rate
  const getNodeColor = () => {
    if (isStartNode) return "#1976d2"; // Blue for start
    if (dropOffRate > 50) return "#d32f2f"; // Red for high drop-off
    if (dropOffRate > 25) return "#f57c00"; // Orange for medium drop-off
    return "#388e3c"; // Green for low drop-off
  };

  const nodeColor = getNodeColor();

  return (
    <Box
      className="relative pointer-events-auto"
      data-node-id={id}
      sx={{
        minWidth: 200,
        maxWidth: 280,
      }}
    >
      {/* Only two edge connectors: top (target) and bottom (source) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          width: 12,
          height: 12,
          top: -6,
        }}
        id="a"
      />

      <Box
        className="flex flex-col p-3 bg-white rounded-lg shadow-md"
        sx={{
          border: `3px solid ${nodeColor}`,
          borderLeft: `8px solid ${nodeColor}`,
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Header with badge */}
        <Box className="flex items-start justify-between mb-2">
          <Box className="flex-1">
            {isStartNode && (
              <Box className="flex flex-col gap-1 mb-2">
                <Box className="flex items-center gap-2">
                  <Box
                    component="span"
                    className="px-2 py-0.5 text-xs font-bold text-white rounded"
                    sx={{ bgcolor: nodeColor }}
                  >
                    START
                  </Box>
                  {onChangeStartNode && allNodeIds && allNodeIds.length > 1 && (
                    <Tooltip title="Change starting event">
                      <IconButton
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "#e0e0e0",
                          border: "2px solid #1976d2",
                          "&:hover": { bgcolor: "#bdbdbd" },
                        }}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                      >
                        <IconArrowsShuffle size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {onChangeStartNode && allNodeIds && allNodeIds.length > 1 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#1976d2", fontWeight: 600 }}
                  >
                    Select a starting event below:
                  </Typography>
                )}
              </Box>
            )}
            <Typography
              variant="body2"
              className="font-semibold text-gray-800"
              sx={{ fontSize: "0.875rem", lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            {lines.length > 0 && (
              <Typography
                variant="caption"
                className="text-gray-600"
                sx={{ fontSize: "0.75rem", display: "block", mt: 0.5 }}
              >
                {lines.join(" • ")}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Metrics section - GA4 style */}
        <Box className="mt-2 pt-2 border-t border-gray-200">
          <Box className="flex items-center justify-between mb-1">
            <Typography variant="caption" className="text-gray-600">
              Users
            </Typography>
            <Typography
              variant="body2"
              className="font-bold"
              sx={{ color: nodeColor }}
            >
              {userCount.toLocaleString()}
            </Typography>
          </Box>

          {!isStartNode && totalUsers && totalUsers > 0 && (
            <Box className="flex items-center justify-between mb-1">
              <Typography variant="caption" className="text-gray-600">
                % of total
              </Typography>
              <Typography variant="body2" className="font-semibold">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
          )}

          {dropOffRate > 0 && (
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-0.5">
                <IconTrendingDown size={14} color="#d32f2f" />
                <Typography variant="caption" className="text-gray-600">
                  Drop-off
                </Typography>
              </Box>
              <Typography
                variant="body2"
                className="font-semibold"
                sx={{ color: "#d32f2f" }}
              >
                {dropOffRate.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status indicator dot */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: hasCompleted ? "#4caf50" : "#9e9e9e",
          }}
        />
      </Box>

      {/* Menu for changing start node */}
      {isStartNode && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {allNodeIds?.map((nid) => (
            <MenuItem
              key={nid}
              disabled={nid === id}
              onClick={() => {
                setAnchorEl(null);
                onChangeStartNode?.(nid);
              }}
            >
              {allNodeLabels?.[nid] || nid}
            </MenuItem>
          ))}
        </Menu>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          width: 12,
          height: 12,
          bottom: -6,
        }}
        id="b"
      />
    </Box>
  );
};

export default CustomListNode;
