import { Box } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";
import rawData from "./data.json";
type Data = typeof rawData;

const data = rawData as Data;

function buildRows() {
  const admin = data["admin.recording"];
  const user = data["users.recordings"];
  const all = [admin, ...user];
  return all.map((_, i) => {
    return {
      id: i + 1,
    };
  });
}

const columns: GridColDef[] = [{ field: "id", headerName: "#", width: 60 }];

const Detail = () => {
  const rows = useMemo(() => buildRows(), []);
  return (
    <Box className="p-2">
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        density="compact"
        disableRowSelectionOnClick
        disableColumnResize
      />
    </Box>
  );
};

export default Detail;
