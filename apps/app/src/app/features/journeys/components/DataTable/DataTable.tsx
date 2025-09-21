import { useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import SvgIcon from "@mui/material/SvgIcon";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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
        <SvgIcon fontSize="small" viewBox="0 0 24 24">
          <path
            d="M10 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </SvgIcon>
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
