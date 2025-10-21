import {
  Autocomplete,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconCalendarEvent,
  IconCheck,
  IconClearAll,
  IconFilter,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import theme from "../../lib/mui/theme";

const DRAWER_WIDTH = 320;

interface FilterDrawerProps {
  // Node selection
  allNodeIds?: string[];
  allNodeLabels?: Record<string, string>;
  selectedStartNodeId?: string;
  onStartNodeChange?: (nodeId: string) => void;

  // User selection
  allUserIds?: (string | number)[];
  selectedUserId?: string | number;
  onUserChange?: (userId: string | number | null) => void;
}

const FilterDrawer = ({
  allNodeIds = [],
  allNodeLabels = {},
  selectedStartNodeId,
  onStartNodeChange,
  allUserIds = [],
  selectedUserId,
  onUserChange,
}: FilterDrawerProps) => {
  // Format node options for dropdown
  const nodeOptions = useMemo(() => {
    return allNodeIds.map((id) => ({
      id,
      label: allNodeLabels[id] || id,
    }));
  }, [allNodeIds, allNodeLabels]);

  // Format user options for autocomplete
  const userOptions = useMemo(() => {
    return allUserIds.map((id) => ({
      id: String(id),
      label: `User ${id}`,
    }));
  }, [allUserIds]);

  // Stepper state (0: Event, 1: User)
  const [activeTab, setActiveTab] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  // removed: eventSearchQuery (replaced by Autocomplete inputValue)
  const [eventInputValue, setEventInputValue] = useState("");

  // Determine which tabs are completed
  const isEventTabComplete = Boolean(selectedStartNodeId);
  const isUserTabComplete = Boolean(selectedUserId);

  // Simple filter function used for Enter-to-select
  const matchFirst = useMemo(() => {
    const q = eventInputValue.trim().toLowerCase();
    if (!q) return nodeOptions[0] ?? null;
    return nodeOptions.find((o) => o.label.toLowerCase().includes(q)) || null;
  }, [eventInputValue, nodeOptions]);

  const filteredUserOptions = useMemo(() => {
    if (!userSearchQuery) return userOptions;
    return userOptions.filter((user) =>
      user.label.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [userOptions, userSearchQuery]);

  // (Tabs removed) Step changes handled via StepButton onClick

  // Auto-advance logic
  const handleEventSelect = (nodeId: string) => {
    onStartNodeChange?.(nodeId);
    // Auto-advance to user tab after small delay
    setTimeout(() => setActiveTab(1), 300);
  };

  // Clear all filters
  const handleClearAll = () => {
    onStartNodeChange?.("");
    onUserChange?.(null);
    setUserSearchQuery("");
    // Autocomplete manages its own input; we only control inputValue
    setEventInputValue("");
    setActiveTab(0);
  };

  // Reset to initial state
  const handleReset = () => {
    setUserSearchQuery("");
    // Autocomplete manages its own input; we only control inputValue
    setEventInputValue("");
    if (!selectedStartNodeId) {
      setActiveTab(0);
    }
  };

  return (
    <Drawer
      variant="persistent"
      open
      sx={{
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          position: "sticky",
          borderRight: `1px solid ${theme.palette.divider}`,
          overflow: "auto", // <-- add this line
        },
      }}
    >
      <Stack sx={{ height: "100%", bgcolor: "background.default" }}>
        {/* Main Toolbar with Actions */}
        <Toolbar
          sx={{
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconFilter size={20} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Reset filters">
              <IconButton size="small" onClick={handleReset}>
                <IconRefresh size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear all">
              <IconButton size="small" onClick={handleClearAll}>
                <IconClearAll size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Vertical Stepper */}
          <Box sx={{ px: 1, py: 1 }}>
            <Stepper activeStep={activeTab} orientation="vertical" nonLinear>
              {/* Step 1: Event */}
              <Step completed={isEventTabComplete}>
                <StepButton color="inherit" onClick={() => setActiveTab(0)}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Required
                      </Typography>
                    }
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconCalendarEvent size={16} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Event
                      </Typography>
                    </Stack>
                  </StepLabel>
                </StepButton>
                <StepContent>
                  <Box
                    sx={{
                      animation: "fadeIn 0.3s",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {allNodeIds.length > 0 && onStartNodeChange ? (
                      <>
                        <Divider sx={{ mb: 1 }} />
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={nodeOptions}
                          getOptionLabel={(option) => option.label}
                          value={
                            nodeOptions.find(
                              (n) => n.id === selectedStartNodeId
                            ) || null
                          }
                          inputValue={eventInputValue}
                          onInputChange={(_e, newInput) =>
                            setEventInputValue(newInput)
                          }
                          onChange={(_event, newValue) => {
                            if (newValue) {
                              handleEventSelect(newValue.id);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const first = matchFirst;
                              if (first) {
                                handleEventSelect(first.id);
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Event"
                              variant="outlined"
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          sx={{ mt: 1 }}
                          noOptionsText="No events found"
                          autoHighlight
                          openOnFocus
                          selectOnFocus
                          clearOnBlur={false}
                        />
                      </>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        No events available
                      </Typography>
                    )}
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: User */}
              <Step completed={isUserTabComplete}>
                <StepButton color="inherit" onClick={() => setActiveTab(1)}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Optional
                      </Typography>
                    }
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconUser size={16} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        User
                      </Typography>
                    </Stack>
                  </StepLabel>
                </StepButton>
                <StepContent>
                  <Box
                    sx={{
                      animation: "fadeIn 0.3s",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {allUserIds.length > 0 && onUserChange ? (
                      <>
                        <Divider sx={{ mb: 1 }} />
                        {/* User List Container */}
                        <Box
                          sx={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <List
                            sx={{
                              width: "100%",
                              bgcolor: "background.paper",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              flex: 1,
                              minHeight: 0,
                              overflow: "auto",
                              p: 0,
                            }}
                          >
                            {filteredUserOptions.length === 0 ? (
                              <ListItem>
                                <ListItemText
                                  primary="No users found"
                                  secondary="Try a different search term"
                                  primaryTypographyProps={{
                                    variant: "body2",
                                    color: "text.secondary",
                                  }}
                                  secondaryTypographyProps={{
                                    variant: "caption",
                                  }}
                                />
                              </ListItem>
                            ) : (
                              <>
                                {/* Clear Selection Item */}
                                <ListItemButton
                                  selected={!selectedUserId}
                                  onClick={() => {
                                    onUserChange?.(null);
                                    setUserSearchQuery("");
                                  }}
                                  sx={{
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar
                                      sx={{
                                        bgcolor: "action.selected",
                                        color: "text.secondary",
                                        width: 32,
                                        height: 32,
                                      }}
                                    >
                                      <IconClearAll size={18} />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary="All Users"
                                    secondary="View all user journeys"
                                    primaryTypographyProps={{
                                      fontWeight: !selectedUserId ? 600 : 400,
                                      variant: "body2",
                                    }}
                                    secondaryTypographyProps={{
                                      variant: "caption",
                                    }}
                                  />
                                </ListItemButton>

                                {/* User Items */}
                                {filteredUserOptions.map(
                                  (user: { id: string; label: string }) => (
                                    <ListItemButton
                                      key={user.id}
                                      selected={
                                        String(selectedUserId) === user.id
                                      }
                                      onClick={() => {
                                        onUserChange?.(Number(user.id));
                                        setUserSearchQuery("");
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar
                                          sx={{
                                            bgcolor:
                                              String(selectedUserId) === user.id
                                                ? "primary.main"
                                                : "action.hover",
                                            color:
                                              String(selectedUserId) === user.id
                                                ? "white"
                                                : "text.primary",
                                            width: 32,
                                            height: 32,
                                          }}
                                        >
                                          <IconUser size={18} />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={user.label}
                                        secondary={`User ID: ${user.id}`}
                                        primaryTypographyProps={{
                                          fontWeight:
                                            String(selectedUserId) === user.id
                                              ? 600
                                              : 400,
                                          variant: "body2",
                                        }}
                                        secondaryTypographyProps={{
                                          variant: "caption",
                                        }}
                                      />
                                      {String(selectedUserId) === user.id && (
                                        <IconCheck
                                          size={18}
                                          color={theme.palette.primary.main}
                                        />
                                      )}
                                    </ListItemButton>
                                  )
                                )}
                              </>
                            )}
                          </List>
                        </Box>

                        {selectedUserId && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 1.5,
                              bgcolor: "#e3f2fd",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "#64b5f6",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <IconCheck
                                size={16}
                                style={{ color: "#1976d2" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#0d47a1", fontWeight: 500 }}
                              >
                                Viewing: <strong>User {selectedUserId}</strong>
                              </Typography>
                            </Stack>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        No users available
                      </Typography>
                    )}
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </Box>

        {/* Add fadeIn animation */}
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </Stack>
    </Drawer>
  );
};

export default FilterDrawer;
