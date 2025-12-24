import {
  Autocomplete,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { IconFilterOff } from "@tabler/icons-react";
import { useMemo } from "react";
import { useGetEventIdentitiesQuery } from "../../../../../lib/redux/api/projects/project/project";

interface StartingPointSelectorProps {
  projectId: string;
  selectedEventKey: string | null;
  onEventKeyChange: (eventKey: string | null) => void;
}

interface EventOption {
  key: string;
  type: string;
  name: string;
  label: string;
  eventCount: number;
}

const StartingPointSelector: React.FC<StartingPointSelectorProps> = ({
  projectId,
  selectedEventKey,
  onEventKeyChange,
}) => {
  // Fetch event identities for the project
  const { data: eventIdentities, isLoading } =
    useGetEventIdentitiesQuery(projectId);

  const eventOptions: EventOption[] = useMemo(() => {
    if (!eventIdentities) return [];
    return eventIdentities.map((identity) => ({
      key: identity.key,
      type: identity.type,
      name: identity.name,
      label: `${identity.type}: ${identity.name}`,
      eventCount: identity.eventCount,
    }));
  }, [eventIdentities]);

  const selectedOption =
    eventOptions.find((opt) => opt.key === selectedEventKey) || null;

  const handleClearFilter = () => {
    onEventKeyChange(null);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Autocomplete
        size="small"
        value={selectedOption}
        onChange={(_event, newValue) => {
          onEventKeyChange(newValue?.key || null);
        }}
        options={eventOptions}
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => (
          <li {...props} key={option.key}>
            <Box>
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.type} • {option.eventCount} events
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Starting Point"
            placeholder="Select starting event..."
          />
        )}
        sx={{ minWidth: 300 }}
        loading={isLoading}
        disabled={isLoading}
        clearOnEscape
      />
      {selectedEventKey && (
        <>
          <Chip
            label={`Filtering from: ${selectedOption?.name || selectedEventKey}`}
            color="primary"
            variant="outlined"
            onDelete={handleClearFilter}
          />
          <Button
            variant="text"
            startIcon={<IconFilterOff />}
            onClick={handleClearFilter}
            size="small"
          >
            Clear Filter
          </Button>
        </>
      )}
    </Box>
  );
};

export default StartingPointSelector;
