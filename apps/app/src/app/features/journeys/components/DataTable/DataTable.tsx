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

import rows from "./data.json";

const paginationModel = { page: 0, pageSize: 25 };

export default function DataTable() {
  return (
    <Paper className="h-full w-full">
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
