import { Alert, Box, Typography } from "@mui/material";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTransitionsQuery } from "../../../lib/redux/api/projects/project/project";
import { EventDiscoveryPanel } from "../shared/components/EventDiscoveryPanel";
import { TransitionFlowContent } from "./components/TransitionFlowContent";

export function TransitionFlow() {
  const { projectId } = useParams<{ projectId: string }>();
  const [anchorEventId, setAnchorEventId] = useState<string | null>(null);
  const direction = "forward";
  const topN = 5;
  const depth = 2;

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

  const handleEventSelect = (eventId: string) => {
    setAnchorEventId(eventId);
  };

  if (!projectId) {
    return (
      <Alert severity="error">
        Project ID is missing. Please navigate from a valid project.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      <EventDiscoveryPanel
        projectId={projectId}
        selectedEventId={anchorEventId}
        onEventSelect={handleEventSelect}
      />

      <Box sx={{ flexGrow: 1, position: "relative" }}>
        {!anchorEventId ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <IconFilter size={64} stroke={1.5} color="#9ca3af" />
            <Typography variant="h6" color="text.secondary">
              Select an Anchor Event
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              maxWidth={400}
            >
              Choose an event from the left panel to explore transitions
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
