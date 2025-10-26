import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconCalendarEvent,
  IconClearAll,
  IconFilter,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import theme from "../../lib/mui/theme";

const DRAWER_WIDTH = 320;

interface FilterDrawerProps {
  allNodeIds?: string[];
  allNodeLabels?: Record<string, string>;
  selectedStartNodeId?: string;
  onStartNodeChange?: (nodeId: string) => void;
  allUserIds?: (string | number)[];
  selectedUserId?: string | number | "all";
  onUserChange?: (userId: string | number | "all" | null) => void;
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
  const nodeOptions = useMemo(
    () => allNodeIds.map((id) => ({ id, label: allNodeLabels[id] || id })),
    [allNodeIds, allNodeLabels]
  );
  const userOptions = useMemo(
    () => [
      { id: "all", label: "All Users" },
      ...allUserIds.map((id) => ({ id: String(id), label: `User ${id}` })),
    ],
    [allUserIds]
  );

  const [activeTab, setActiveTab] = useState(0);
  const [eventInputValue, setEventInputValue] = useState("");
  const [userInputValue, setUserInputValue] = useState("");

  // Draft (local) selections that should NOT affect charts until Done is pressed
  const [draftStartNodeId, setDraftStartNodeId] = useState<string | null>(
    selectedStartNodeId ?? null
  );
  const [draftUserId, setDraftUserId] = useState<string>(
    String(selectedUserId ?? "all")
  );

  // Keep drafts in sync if external (applied) selections change from elsewhere
  useEffect(() => {
    setDraftStartNodeId(selectedStartNodeId ?? null);
  }, [selectedStartNodeId]);
  useEffect(() => {
    setDraftUserId(String(selectedUserId ?? "all"));
  }, [selectedUserId]);

  // Completion indicator should be based on draft values, not applied ones
  const isEventTabComplete = Boolean(draftStartNodeId);
  const isUserTabComplete = Boolean(draftUserId);

  // Default to "all" users if no applied selection is made
  const effectiveUserId = selectedUserId || "all";

  const matchFirstEvent = useMemo(() => {
    const q = eventInputValue.trim().toLowerCase();
    if (!q) return nodeOptions[0] ?? null;
    return nodeOptions.find((o) => o.label.toLowerCase().includes(q)) || null;
  }, [eventInputValue, nodeOptions]);

  const matchFirstUser = useMemo(() => {
    const q = userInputValue.trim().toLowerCase();
    if (!q) return userOptions[0] ?? null;
    return userOptions.find((o) => o.label.toLowerCase().includes(q)) || null;
  }, [userInputValue, userOptions]);

  const handleClearAll = () => {
    // Clear both draft and applied selections explicitly
    setDraftStartNodeId(null);
    setDraftUserId("all");
    onStartNodeChange?.("");
    onUserChange?.("all");
    setEventInputValue("");
    setUserInputValue("");
    setActiveTab(0);
  };

  const handleReset = () => {
    // Reset search inputs only; do not apply
    setEventInputValue("");
    setUserInputValue("");
    if (!draftStartNodeId) setActiveTab(0);
  };

  const handleDone = () => {
    // Apply filters based on DRAFT selections only when Done is pressed
    if (draftStartNodeId) {
      onStartNodeChange?.(draftStartNodeId);
    }
    onUserChange?.(draftUserId === "all" ? "all" : Number(draftUserId));
    // Clear input values after applying filters (keeps draft selections visible in chips)
    setEventInputValue("");
    setUserInputValue("");
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
          overflow: "auto",
        },
      }}
    >
      <Stack sx={{ height: "100%", bgcolor: "background.default" }}>
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
          <Box sx={{ px: 1, py: 1 }}>
            <Stepper activeStep={activeTab} orientation="vertical" nonLinear>
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
                        Starting Event
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
                    <Divider sx={{ mb: 1 }} />
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={nodeOptions}
                      getOptionLabel={(option) => option.label}
                      value={
                        nodeOptions.find((n) => n.id === draftStartNodeId) ||
                        null
                      }
                      inputValue={eventInputValue}
                      onInputChange={(_e, v) => setEventInputValue(v)}
                      onChange={(_e, v) => {
                        setDraftStartNodeId(v ? v.id : null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const first = matchFirstEvent;
                          if (first) {
                            setDraftStartNodeId(first.id);
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
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      sx={{ mt: 1 }}
                      noOptionsText="No events found"
                      autoHighlight
                      openOnFocus
                      selectOnFocus
                      clearOnBlur={false}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" disabled>
                          Back
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => setActiveTab(1)}
                          disabled={!draftStartNodeId}
                        >
                          Next
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </StepContent>
              </Step>

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
                    <Divider sx={{ mb: 1 }} />
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={userOptions}
                      getOptionLabel={(option) => option.label}
                      value={
                        userOptions.find((u) => u.id === String(draftUserId)) ||
                        null
                      }
                      inputValue={userInputValue}
                      onInputChange={(_e, v) => setUserInputValue(v)}
                      onChange={(_e, v) => {
                        setDraftUserId(v ? String(v.id) : "all");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const first = matchFirstUser;
                          if (first) {
                            setDraftUserId(String(first.id));
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select User"
                          variant="outlined"
                        />
                      )}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      sx={{ mt: 1 }}
                      noOptionsText="No users found"
                      autoHighlight
                      openOnFocus
                      selectOnFocus
                      clearOnBlur={false}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => setActiveTab(0)}>
                          Back
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!draftStartNodeId}
                          onClick={handleDone}
                        >
                          Done
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </Box>

        {/* Selected Filters Summary as Alerts at the bottom */}
        <Box
          sx={{ px: 2, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Stack spacing={1}>
            <Alert
              severity={selectedStartNodeId ? "info" : "warning"}
              icon={<IconCalendarEvent size={18} />}
            >
              <AlertTitle>Starting Event</AlertTitle>
              {selectedStartNodeId
                ? allNodeLabels[selectedStartNodeId] || selectedStartNodeId
                : "No starting event selected"}
            </Alert>
            <Alert
              severity={effectiveUserId === "all" ? "success" : "info"}
              icon={<IconUser size={18} />}
            >
              <AlertTitle>Selected User</AlertTitle>
              {effectiveUserId === "all"
                ? "All Users"
                : `User ${effectiveUserId}`}
            </Alert>
          </Stack>
        </Box>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Stack>
    </Drawer>
  );
};

export default FilterDrawer;
