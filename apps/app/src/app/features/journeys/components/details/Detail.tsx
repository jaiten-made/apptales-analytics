import { Chip, IconButton, ListItem, ListItemText, Paper } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { IconArrowRight } from "@tabler/icons-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { useLoaderData, useNavigate } from "react-router";
import { actions } from "../../../../../lib/redux/features/user-journeys/slice";
import { useAppDispatch } from "../../../../../lib/redux/hook";
import rawData from "./data.json";

type Row = {
  id: number;
  createdAt: string;
  anonymousUserId: number;
  action: string;
  timeToComplete?: number; // milliseconds
  status?: string; // added status
};

const data = rawData as Row[];

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
  const { id: journeyId, name } = useLoaderData();

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
      flex: 0.6,
      sortable: false,
      filterable: false,
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
      sortable: false,
      filterable: false,
      width: 160,
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
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams<Row>) => {
        const handlePlay = () => {
          dispatch(
            actions.setSelectedUserStory({
              name: `User Journey ${params.row.id}`,
            })
          );
          navigate(`/journeys/${journeyId}/user-journeys/${params.row.id}`);
        };
        return (
          <IconButton size="small" onClick={handlePlay} aria-label="play">
            <IconArrowRight />
          </IconButton>
        );
      },
    },
  ];

  return (
    <Paper className="flex flex-col gap-2">
      <ListItem>
        <ListItemText
          primary={name}
          secondary="Users who attempted or completed this journey"
        />
      </ListItem>
      <DataGrid<Row>
        rows={data}
        columns={columns}
        hideFooter
        disableRowSelectionOnClick
        disableColumnResize
        sx={{
          border: 0,
        }}
      />
    </Paper>
  );
};

export default Detail;
