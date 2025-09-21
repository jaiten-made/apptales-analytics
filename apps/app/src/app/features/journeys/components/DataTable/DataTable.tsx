import Paper from "@mui/material/Paper";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    sortable: true,
    width: 220,
  },
];

import { useTheme } from "@mui/material";
import rows from "./data.json";

const paginationModel = { page: 0, pageSize: 25 };

export default function DataTable() {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        maxHeight: `calc(100vh - ${theme.mixins.appbar?.height}px)`,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
