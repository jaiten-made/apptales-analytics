import {
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
} from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { IconArrowRight } from "@tabler/icons-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import rawData from "./data.json";
type Row = {
  id: number;
  createdAt: string;
  anonymousUserId: number;
  action: string;
};

const data = rawData as Row[];

const columns: GridColDef<Row>[] = [
  {
    field: "anonymousUserId",
    headerName: "User",
    flex: 1,
    valueFormatter: (value) => `User ${value as number}`,
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
        const distance = formatDistanceToNowStrict(date, { addSuffix: false });
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
      const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Simple action for now; can be wired to real playback later
        console.log("Play story", params.row.id);
      };
      return (
        <IconButton size="small" onClick={handlePlay} aria-label="play">
          <IconArrowRight />
        </IconButton>
      );
    },
  },
];

const Detail = () => {
  return (
    <Paper className="flex flex-col gap-2">
      <ListItem disableGutters>
        <ListItemButton>
          <ListItemText primary="Reference User Story" />
          <IconButton edge="end">
            <IconArrowRight />
          </IconButton>
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListSubheader>Recorded User Stories</ListSubheader>
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
