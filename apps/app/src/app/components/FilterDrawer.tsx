import { theme } from "@apptales/mui-config";
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
import { useGetEventsQuery } from "../../lib/redux/api/events/events";

const DRAWER_WIDTH = 320;

const FilterDrawer = () => {
  const mockUsers = [
    { id: "all", label: "All Users" },
    { id: "1", label: "User 1" },
    { id: "2", label: "User 2" },
  ];

  const { data: events } = useGetEventsQuery(undefined);

  // Transform events data to match the expected format
  const eventOptions: { id: string; label: string }[] =
    events?.map((event) => ({
      id: String(event.id ?? event._id ?? event),
      label: String(event.name ?? event.label ?? event.type ?? event),
    })) ?? [];

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
              <IconButton size="small">
                <IconRefresh size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear all">
              <IconButton size="small">
                <IconClearAll size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 1, py: 1 }}>
            <Stepper activeStep={0} orientation="vertical" nonLinear>
              <Step completed={false}>
                <StepButton color="inherit">
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
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Divider sx={{ mb: 1 }} />
                    <Autocomplete<{ id: string; label: string }>
                      fullWidth
                      size="small"
                      options={eventOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Event"
                          variant="outlined"
                        />
                      )}
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" disabled>
                          Back
                        </Button>
                        <Button size="small">Next</Button>
                      </Stack>
                    </Box>
                  </Box>
                </StepContent>
              </Step>

              <Step completed={false}>
                <StepButton color="inherit">
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
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Divider sx={{ mb: 1 }} />
                    <Autocomplete<{ id: string; label: string }>
                      fullWidth
                      size="small"
                      options={mockUsers}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select User"
                          variant="outlined"
                        />
                      )}
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button size="small">Back</Button>
                        <Button size="small">Done</Button>
                      </Stack>
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </Box>

        <Box
          sx={{ px: 2, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Stack spacing={1}>
            <Alert severity="warning" icon={<IconCalendarEvent size={18} />}>
              <AlertTitle>Starting Event</AlertTitle>
              No starting event selected
            </Alert>
            <Alert severity="success" icon={<IconUser size={18} />}>
              <AlertTitle>Selected User</AlertTitle>
              All Users
            </Alert>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default FilterDrawer;
