import {
  Autocomplete,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { IconFilterOff } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Only fetch if user has typed at least 2 characters
  const shouldFetch = debouncedSearch.length >= 2;

  const { data: eventIdentities, isFetching } = useGetEventIdentitiesQuery(
    shouldFetch ? { projectId, search: debouncedSearch } : skipToken
  );

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

  const handleClearFilter = useCallback(() => {
    onEventKeyChange(null);
    setInputValue("");
  }, [onEventKeyChange]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Autocomplete
        size="small"
        value={selectedOption}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => {
          setInputValue(newInputValue);
        }}
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
                {option.type} • {option.eventCount.toLocaleString()} events
              </Typography>
            </Box>
          </li>
        )}
        noOptionsText={
          inputValue.length < 2
            ? "Type at least 2 characters to search"
            : "No events found. Try a different search."
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Starting Point"
            placeholder="Type to search events..."
            helperText={
              inputValue.length >= 2 && eventOptions.length >= 10
                ? "Showing top 10 results. Be more specific to narrow down."
                : inputValue.length >= 2 && eventOptions.length > 0
                  ? `Found ${eventOptions.length} event${eventOptions.length !== 1 ? "s" : ""}`
                  : "Type at least 2 characters"
            }
          />
        )}
        sx={{ minWidth: 300 }}
        loading={isFetching}
        filterOptions={(x) => x}
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
