import {
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useGetEventIdentitiesQuery } from "../../../../lib/redux/api/projects/project/project";

interface EventDiscoveryPanelProps {
  projectId: string;
  selectedEventId: string | null;
  onEventSelect: (eventId: string, eventKey: string) => void;
}

interface EventIdentity {
  id: string;
  key: string;
  type: string;
  name: string;
  category: string;
  eventCount: number;
}

export function EventDiscoveryPanel({
  projectId,
  selectedEventId,
  onEventSelect,
}: EventDiscoveryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: eventIdentities, isFetching } = useGetEventIdentitiesQuery({
    projectId,
  });

  // Client-side filtering for search
  const filteredEvents = useMemo(() => {
    if (!eventIdentities) return [];

    if (!searchTerm) return eventIdentities;

    const lowerSearch = searchTerm.toLowerCase();
    return eventIdentities.filter(
      (event: EventIdentity) =>
        event.name.toLowerCase().includes(lowerSearch) ||
        event.key.toLowerCase().includes(lowerSearch)
    );
  }, [eventIdentities, searchTerm]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: 340,
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Select Anchor Event
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select an event to visualize user journeys and discover the most
          common paths through your product
        </Typography>
      </Box>

      {/* Search Box */}
      <Box sx={{ p: 2, pt: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Event List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {isFetching ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={32} />
          </Box>
        ) : filteredEvents.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? "No matching events found"
                : "No events recorded yet"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredEvents.map((event: EventIdentity) => (
              <ListItem key={event.id} disablePadding>
                <ListItemButton
                  selected={selectedEventId === event.id}
                  onClick={() => onEventSelect(event.id, event.key)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "& .MuiChip-root": {
                        bgcolor: "primary.dark",
                        color: "primary.contrastText",
                        borderColor: "primary.contrastText",
                      },
                      "& .MuiTypography-root": {
                        color: "primary.contrastText",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={selectedEventId === event.id ? 600 : 500}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            selectedEventId === event.id
                              ? "inherit"
                              : "text.secondary",
                          opacity: selectedEventId === event.id ? 0.9 : 1,
                        }}
                      >
                        {event.type}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
