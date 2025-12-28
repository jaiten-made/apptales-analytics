import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { useGetEventIdentitiesQuery } from "../../../../lib/redux/api/projects/project/project";

interface TransitionAnchorSelectorProps {
  projectId: string;
  anchorEventId: string | null;
  direction: "forward" | "backward";
  topN: number;
  depth: number;
  onAnchorChange: (eventId: string | null) => void;
  onDirectionChange: (direction: "forward" | "backward") => void;
  onTopNChange: (topN: number) => void;
  onDepthChange: (depth: number) => void;
}

export function TransitionAnchorSelector({
  projectId,
  anchorEventId,
  direction,
  topN,
  depth,
  onAnchorChange,
  onDirectionChange,
  onTopNChange,
  onDepthChange,
}: TransitionAnchorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Only fetch if user has typed at least 2 characters
  const shouldFetch = debouncedSearch.length >= 2;

  const { data: eventIdentities = [], isLoading } = useGetEventIdentitiesQuery(
    shouldFetch ? { projectId, search: debouncedSearch } : skipToken
  );

  const selectedEvent = eventIdentities.find((e) => e.id === anchorEventId);

  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Anchor Event Selector */}
        <Autocomplete
          sx={{ flex: 1 }}
          options={eventIdentities}
          getOptionLabel={(option) => option.key}
          value={selectedEvent || null}
          onChange={(_event, newValue) => {
            onAnchorChange(newValue?.id || null);
          }}
          inputValue={searchTerm}
          onInputChange={(_event, newInputValue) => {
            handleSearchChange(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Anchor Event"
              placeholder="Search for an event..."
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body2">{option.key}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.type} • {option.eventCount.toLocaleString()}{" "}
                  occurrences
                </Typography>
              </Box>
            </li>
          )}
          loading={isLoading}
          loadingText="Searching events..."
          noOptionsText={
            searchTerm.length < 2
              ? "Type at least 2 characters to search"
              : "No events found"
          }
        />

        {/* Direction Toggle */}
        <ToggleButtonGroup
          value={direction}
          exclusive
          onChange={(_event, newDirection) => {
            if (newDirection) onDirectionChange(newDirection);
          }}
          aria-label="transition direction"
        >
          <ToggleButton value="forward" aria-label="forward transitions">
            <ArrowForwardIcon sx={{ mr: 1 }} />
            Forward
          </ToggleButton>
          <ToggleButton value="backward" aria-label="backward transitions">
            <ArrowBackIcon sx={{ mr: 1 }} />
            Backward
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "flex", gap: 4 }}>
        {/* Top N Slider */}
        <Box sx={{ flex: 1 }}>
          <Typography gutterBottom variant="body2" color="text.secondary">
            Top N Transitions: {topN}
          </Typography>
          <Slider
            value={topN}
            onChange={(_event, newValue) => onTopNChange(newValue as number)}
            min={3}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Depth Slider */}
        <Box sx={{ flex: 1 }}>
          <Typography gutterBottom variant="body2" color="text.secondary">
            Depth Levels: {depth}
          </Typography>
          <Slider
            value={depth}
            onChange={(_event, newValue) => onDepthChange(newValue as number)}
            min={1}
            max={5}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
    </Stack>
  );
}
