import {
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
  Tab,
  Tabs,
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

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");

  // Determine which tabs are completed
  const isEventTabComplete = Boolean(selectedStartNodeId);
  const isUserTabComplete = Boolean(selectedUserId);

  // Filter events based on search query
  const filteredEventOptions = useMemo(() => {
    if (!eventSearchQuery) return nodeOptions;
    return nodeOptions.filter((node) =>
      node.label.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );
  }, [nodeOptions, eventSearchQuery]);

  // Filter users based on search query
  const filteredUserOptions = useMemo(() => {
    if (!userSearchQuery) return userOptions;
    return userOptions.filter((user) =>
      user.label.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [userOptions, userSearchQuery]);

  // Auto-advance to next tab when current is completed
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
    setEventSearchQuery("");
    setActiveTab(0);
  };

  // Reset to initial state
  const handleReset = () => {
    setUserSearchQuery("");
    setEventSearchQuery("");
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
          {/* Tabs Header with Stepper-like indicators */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Tab
              icon={
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isEventTabComplete
                      ? "success.main"
                      : activeTab === 0
                        ? "primary.main"
                        : "action.disabled",
                    color: "white",
                    transition: "all 0.3s",
                    mb: 0.5,
                  }}
                >
                  {isEventTabComplete ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconCalendarEvent size={16} />
                  )}
                </Box>
              }
              label={
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Event
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontSize: "0.65rem", opacity: 0.7 }}
                  >
                    Required
                  </Typography>
                </Box>
              }
              iconPosition="top"
              sx={{
                minHeight: 72,
                py: 1,
              }}
            />
            <Tab
              icon={
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isUserTabComplete
                      ? "success.main"
                      : activeTab === 1
                        ? "primary.main"
                        : "action.disabled",
                    color: "white",
                    transition: "all 0.3s",
                    mb: 0.5,
                  }}
                >
                  {isUserTabComplete ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconUser size={16} />
                  )}
                </Box>
              }
              label={
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    User
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontSize: "0.65rem", opacity: 0.7 }}
                  >
                    Optional
                  </Typography>
                </Box>
              }
              iconPosition="top"
              sx={{
                minHeight: 72,
                py: 1,
              }}
            />
          </Tabs>

          {/* Tab Panels */}
          <Box>
            {/* Tab 1: Starting Event */}
            {activeTab === 0 && (
              <Box
                sx={{
                  animation: "fadeIn 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {allNodeIds.length > 0 && onStartNodeChange ? (
                  <>
                    <Divider sx={{ mb: 1 }} />

                    <List>
                      {filteredEventOptions.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary="No events found"
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
                        filteredEventOptions.map((node) => (
                          <ListItemButton
                            key={node.id}
                            selected={selectedStartNodeId === node.id}
                            onClick={() => {
                              handleEventSelect(node.id);
                              setEventSearchQuery("");
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor:
                                    selectedStartNodeId === node.id
                                      ? "success.main"
                                      : "action.hover",
                                  color:
                                    selectedStartNodeId === node.id
                                      ? "white"
                                      : "text.primary",
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {selectedStartNodeId === node.id ? (
                                  <IconCheck size={18} />
                                ) : (
                                  <IconCalendarEvent size={18} />
                                )}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={node.label}
                              secondary={`Event ID: ${node.id}`}
                              primaryTypographyProps={{
                                fontWeight:
                                  selectedStartNodeId === node.id ? 600 : 400,
                                variant: "body2",
                              }}
                              secondaryTypographyProps={{
                                variant: "caption",
                              }}
                            />
                            {selectedStartNodeId === node.id && (
                              <IconCheck
                                size={18}
                                color={theme.palette.success.main}
                              />
                            )}
                          </ListItemButton>
                        ))
                      )}
                    </List>
                  </>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    No events available
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 2: User Filter */}
            {activeTab === 1 && (
              <Box
                sx={{
                  animation: "fadeIn 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                                onUserChange(null);
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
                            {filteredUserOptions.map((user) => (
                              <ListItemButton
                                key={user.id}
                                selected={String(selectedUserId) === user.id}
                                onClick={() => {
                                  onUserChange(Number(user.id));
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
                            ))}
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconCheck size={16} style={{ color: "#1976d2" }} />
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
            )}
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
