import { Alert, Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTransitionsQuery } from "../../../lib/redux/api/projects/project/project";
import { TransitionAnchorSelector } from "./components/TransitionAnchorSelector";
import { TransitionFlowContent } from "./components/TransitionFlowContent";

export function TransitionFlow() {
  const { projectId } = useParams<{ projectId: string }>();
  const [anchorEventId, setAnchorEventId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [topN, setTopN] = useState(5);
  const [depth, setDepth] = useState(2);

  const { data, isLoading, error } = useGetTransitionsQuery(
    projectId && anchorEventId
      ? { projectId, anchorEventId, direction, topN, depth }
      : {
          projectId: "",
          anchorEventId: "",
          direction: "forward",
          topN: 5,
          depth: 1,
        },
    {
      skip: !projectId || !anchorEventId,
    }
  );

  if (!projectId) {
    return (
      <Alert severity="error">
        Project ID is missing. Please navigate from a valid project.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Event Transition Paths
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Visualize the most common user journeys using Markov chain
          probabilities
        </Typography>

        <TransitionAnchorSelector
          projectId={projectId}
          anchorEventId={anchorEventId}
          direction={direction}
          topN={topN}
          depth={depth}
          onAnchorChange={setAnchorEventId}
          onDirectionChange={setDirection}
          onTopNChange={setTopN}
          onDepthChange={setDepth}
        />
      </Paper>

      <Box sx={{ flexGrow: 1, position: "relative" }}>
        {!anchorEventId ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select an anchor event to start exploring transitions
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Alert severity="error">
              Failed to load transition data. Please try again.
            </Alert>
          </Box>
        ) : (
          <TransitionFlowContent
            data={data}
            isLoading={isLoading}
            direction={direction}
          />
        )}
      </Box>
    </Box>
  );
}
