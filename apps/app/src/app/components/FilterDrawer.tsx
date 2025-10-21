import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
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
  allNodeIds?: string[];
  allNodeLabels?: Record<string, string>;
  selectedStartNodeId?: string;
  onStartNodeChange?: (nodeId: string) => void;
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
  const nodeOptions = useMemo(
    () => allNodeIds.map((id) => ({ id, label: allNodeLabels[id] || id })),
    [allNodeIds, allNodeLabels]
  );
  const userOptions = useMemo(
    () => allUserIds.map((id) => ({ id: String(id), label: `User ${id}` })),
    [allUserIds]
  );

  const [activeTab, setActiveTab] = useState(0);
  const [eventInputValue, setEventInputValue] = useState("");
  const [userInputValue, setUserInputValue] = useState("");

  const isEventTabComplete = Boolean(selectedStartNodeId);
  const isUserTabComplete = Boolean(selectedUserId);

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

  const handleEventSelect = (nodeId: string) => {
    onStartNodeChange?.(nodeId);
    setTimeout(() => setActiveTab(1), 300);
  };

  const handleClearAll = () => {
    onStartNodeChange?.("");
    onUserChange?.(null);
    setEventInputValue("");
    setUserInputValue("");
    setActiveTab(0);
  };

  const handleReset = () => {
    setEventInputValue("");
    setUserInputValue("");
    if (!selectedStartNodeId) setActiveTab(0);
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
                    <Divider sx={{ mb: 1 }} />
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={nodeOptions}
                      getOptionLabel={(option) => option.label}
                      value={
                        nodeOptions.find((n) => n.id === selectedStartNodeId) ||
                        null
                      }
                      inputValue={eventInputValue}
                      onInputChange={(_e, v) => setEventInputValue(v)}
                      onChange={(_e, v) => {
                        if (v) handleEventSelect(v.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const first = matchFirstEvent;
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
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      sx={{ mt: 1 }}
                      noOptionsText="No events found"
                      autoHighlight
                      openOnFocus
                      selectOnFocus
                      clearOnBlur={false}
                    />
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
                        userOptions.find(
                          (u) => u.id === String(selectedUserId)
                        ) || null
                      }
                      inputValue={userInputValue}
                      onInputChange={(_e, v) => setUserInputValue(v)}
                      onChange={(_e, v) => {
                        if (v) onUserChange?.(Number(v.id));
                        else onUserChange?.(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const first = matchFirstUser;
                          if (first) {
                            onUserChange?.(Number(first.id));
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
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
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
