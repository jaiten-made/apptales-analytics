import { useTheme } from "@mui/material";
import Paper from "@mui/material/Paper";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router";
import rows from "../components/details/data.json";

const columns = (navigate: ReturnType<typeof useNavigate>): GridColDef[] => [
  { field: "id", headerName: "ID", width: 80 },
  { field: "anonymousUserId", headerName: "User", flex: 1 },
  { field: "createdAt", headerName: "Created At", flex: 1 },
  {
    field: "actions",
    headerName: "",
    sortable: false,
    width: 100,
    renderCell: (params) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          const userStoryId = params.row.id;
          const storyId = params.row.storyId ?? params.row.storyId;
          if (storyId) {
            navigate(`/stories/${storyId}/user-stories/${userStoryId}`);
          }
        }}
      >
        View
      </button>
    ),
  },
];

export default function UserStoriesList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: storyId } = useParams();

  const handleRowClick = (row: { id: number | string }) => {
    if (!storyId) return;
    navigate(`/stories/${storyId}/user-stories/${row.id}`);
  };

  return (
    <Paper
      sx={{
        maxHeight: `calc(100vh - ${theme.mixins.appbar?.height}px)`,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns(navigate)}
        hideFooter
        disableRowSelectionOnClick
        disableColumnResize
        onRowClick={(params) => handleRowClick(params.row)}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
