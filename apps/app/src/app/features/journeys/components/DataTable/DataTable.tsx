import { useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { IconChevronRight } from "@tabler/icons-react";
import rows from "./data.json";

const paginationModel = { page: 0, pageSize: 25 };

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    sortable: true,
    flex: 1,
    minWidth: 220,
  },
  {
    field: "actions",
    headerName: "",
    sortable: false,
    width: 56,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          console.log("row action clicked", params.row);
        }}
      >
        <IconChevronRight />
      </IconButton>
    ),
  },
];

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
        isRowSelectable={() => false}
        onRowClick={(params) => console.log("row clicked", params.row)}
        disableColumnResize
        sx={{
          border: 0,
        }}
      />
    </Paper>
  );
}
