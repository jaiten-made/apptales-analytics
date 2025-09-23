import {
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { IconArrowRight } from "@tabler/icons-react";
import rawData from "./data.json";
type Data = typeof rawData;

const data = rawData as Data;

const columns: GridColDef[] = [{ field: "id", headerName: "#" }];

const Detail = () => {
  return (
    <Paper className="flex flex-col gap-2">
      <ListItem disableGutters>
        <ListItemButton>
          <ListItemText primary="Reference User Journey" />
          <IconButton edge="end">
            <IconArrowRight />
          </IconButton>
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListSubheader>Recorded User Journeys</ListSubheader>
      <DataGrid
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
