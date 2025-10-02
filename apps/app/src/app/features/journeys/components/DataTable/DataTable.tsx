import { Box, LinearProgress, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { actions } from "../../../../../lib/redux/features/journeys/slice";
import { useAppDispatch } from "../../../../../lib/redux/hook";
import rows from "./data.json";

const paginationModel = { page: 0, pageSize: 25 };

export default function DataTable() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const columns = (navigate: ReturnType<typeof useNavigate>): GridColDef[] => [
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      flex: 1,
      minWidth: 220,
    },
    {
      field: "completion",
      headerName: "Completion",
      sortable: true,
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const raw = params.row.completion;
        let percent = 0;
        if (raw == null) {
          percent = 0;
        } else if (typeof raw === "number") {
          percent = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
        } else {
          const parsed = Number(raw);
          percent = isNaN(parsed)
            ? 0
            : parsed <= 1
              ? Math.round(parsed * 100)
              : Math.round(parsed);
        }

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                mr: 1,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={percent}
                aria-label={`completion-${params.id}`}
                sx={{ width: "100%", height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ minWidth: 40, textAlign: "right" }}
            >
              {percent}%
            </Typography>
          </Box>
        );
      },
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
            const id = params.row.id;
            dispatch(actions.setSelectedJourney({ name: params.row.name }));
            navigate(`/journeys/${id}`);
          }}
        >
          <IconArrowRight />
        </IconButton>
      ),
    },
  ];

  return (
    <Paper
      sx={{
        maxHeight: `calc(100vh - ${theme.mixins.appbar?.height}px)`,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns(navigate)}
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
