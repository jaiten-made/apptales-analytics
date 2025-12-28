import {
  Box,
  CircularProgress,
  Drawer,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { IconSearch } from "@tabler/icons-react";
import { memo, useMemo, useState } from "react";
import { useGetEventIdentitiesQuery } from "../../../../lib/redux/api/projects/project/project";

interface EventDiscoveryPanelProps {
  projectId: string;
  selectedEventId: string | null;
  onEventSelect: (eventId: string, eventKey: string) => void;
  open?: boolean;
}

interface EventIdentity {
  id: string;
  key: string;
  type: string;
  name: string;
  category: string;
  eventCount: number;
}

const EventListItem = memo(
  ({
    event,
    isSelected,
    onSelect,
  }: {
    event: EventIdentity;
    isSelected: boolean;
    onSelect: (id: string, key: string) => void;
  }) => (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(event.id, event.key)}
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 1,
          mb: 0.5,
          transition: "all 0.2s",
          "&.Mui-selected": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "& .MuiTypography-root": {
              color: "inherit",
            },
            "& .MuiListItemText-secondary": {
              color: "inherit",
              opacity: 0.8,
            },
          },
        }}
      >
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight={isSelected ? 600 : 500} noWrap>
              {event.name}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              {event.type}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  )
);

EventListItem.displayName = "EventListItem";

export function EventDiscoveryPanel({
  projectId,
  selectedEventId,
  onEventSelect,
  open = true,
}: EventDiscoveryPanelProps) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: eventIdentities, isFetching } = useGetEventIdentitiesQuery({
    projectId,
  });

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
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        padding: 2,
      }}
      slotProps={{
        paper: {
          sx: {
            position: "relative",
            height: "100%",
            width: 340,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }
        }
      }}
    >
      <Stack spacing={2} sx={{ p: 2, pb: 0, flexShrink: 0 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Select Anchor Event
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select an event to visualize user journeys and discover common paths.
          </Typography>
        </Box>

        <TextField
          size="small"
          fullWidth
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.default",
            },
          }}
        />
      </Stack>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {isFetching ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: 200 }}
          >
            <CircularProgress size={24} />
          </Stack>
        ) : filteredEvents.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: 200, textAlign: "center", opacity: 0.7 }}
            spacing={1}
          >
            <IconSearch size={32} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? "No events found" : "No events recorded"}
            </Typography>
          </Stack>
        ) : (
          <List disablePadding>
            {filteredEvents.map((event: EventIdentity) => (
              <EventListItem
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onSelect={onEventSelect}
              />
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
