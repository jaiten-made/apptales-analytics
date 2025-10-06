import { Chip, IconButton, ListItem, ListItemText, Paper } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { IconArrowRight } from "@tabler/icons-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { useLoaderData, useNavigate } from "react-router";
import { actions } from "../../../../../lib/redux/features/user-journey/slice";
import { useAppDispatch } from "../../../../../lib/redux/hook";
import rawData from "./data.json";

type Row = {
  id: number;
  journeyId?: number; // newly added to filter per journey
  createdAt: string;
  anonymousUserId: number;
  action: string;
  timeToComplete?: number; // milliseconds
  status?: string; // added status
};

const allAttempts = rawData as Row[];

// helper to format milliseconds
const formatMs = (ms?: number) => {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const Detail = () => {
  const navigate = useNavigate();
  const { id: journeyId, name } = useLoaderData() as {
    id: number;
    name: string;
  };

  const dispatch = useAppDispatch();

  const columns: GridColDef<Row>[] = [
    {
      field: "anonymousUserId",
      headerName: "User",
      flex: 1,
      valueFormatter: (value) => `User ${value as number}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Row>) => {
        const val = (params.value ?? params.row.status) as string | undefined;
        if (!val) return <Chip label="—" size="small" />;
        const normalized = val.toLowerCase();
        if (normalized === "success") {
          // lighter green using theme palette
          return (
            <Chip
              label="Success"
              size="small"
              sx={{ bgcolor: "success.light", color: "success.contrastText" }}
            />
          );
        } else if (normalized === "failed") {
          // lighter red using theme palette
          return (
            <Chip
              label="Failed"
              size="small"
              sx={{ bgcolor: "error.light", color: "error.contrastText" }}
            />
          );
        }
        return <Chip label={val} size="small" />;
      },
    },
    {
      field: "duration",
      headerName: "Duration",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Row>) => {
        return <span>{formatMs(params.value as number | undefined)}</span>;
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Row>) => {
        const val = params.value as string | undefined;
        if (!val) return "";
        try {
          const date = parseISO(val);
          const distance = formatDistanceToNowStrict(date, {
            addSuffix: false,
          });
          return `${distance} ago`;
        } catch {
          return val;
        }
      },
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params: GridRenderCellParams<Row>) => {
        const handlePlay = () => {
          dispatch(
            actions.setSelectedUserJourney({
              name: `User Journey ${params.row.id}`,
            })
          );
          navigate(`/journeys/${journeyId}/user-journey/${params.row.id}`);
        };
        return (
          <IconButton size="small" onClick={handlePlay} aria-label="play">
            <IconArrowRight />
          </IconButton>
        );
      },
    },
  ];

  // Filter attempts for this journey (if journeyId numeric). If no matches, show empty state.
  const journeyAttempts = allAttempts.filter(
    (a) => a.journeyId == null || Number(a.journeyId) === Number(journeyId)
  );

  return (
    <Paper className="flex flex-col gap-2">
      <ListItem>
        <ListItemText
          primary={name}
          secondary="Users who attempted or completed this journey"
        />
      </ListItem>
      {journeyAttempts.length === 0 ? (
        <div className="p-6 text-sm opacity-70">
          No user journeys for this journey yet.
        </div>
      ) : (
        <DataGrid<Row>
          rows={journeyAttempts}
          columns={columns}
          hideFooter
          disableRowSelectionOnClick
          disableColumnResize
          sx={{
            border: 0,
          }}
        />
      )}
    </Paper>
  );
};

export default Detail;
