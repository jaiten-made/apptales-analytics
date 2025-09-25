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
import { useNavigate, useParams } from "react-router";
import rawData from "./data.json";
type Row = {
  id: number;
  createdAt: string;
  anonymousUserId: number;
  action: string;
};

const data = rawData as Row[];

const Detail = () => {
  const navigate = useNavigate();
  const { id: storyId } = useParams();

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
          navigate(`/stories/${storyId}/user-stories/${params.row.id}`);
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
      <ListItem disableGutters>
        <ListItemButton>
          <ListItemText primary="Original User Story" />
          <IconButton
            onClick={() => {
              if (storyId) navigate(`/stories/${storyId}/user-stories`);
            }}
          >
            <IconArrowRight />
          </IconButton>
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListSubheader>User Stories</ListSubheader>
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
