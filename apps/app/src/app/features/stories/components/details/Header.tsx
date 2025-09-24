import {
  AppBar,
  Breadcrumbs,
  Divider,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import theme from "../../../../../lib/mui/theme";
import rows from "../DataTable/data.json";

const Header = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isStoriesRoute = location.pathname === "/stories";

  const selectedName = id
    ? rows.find((r) => String(r.id) === String(id))?.name
    : undefined;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderLeft: 0,
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="none"
            color={isStoriesRoute ? "text.primary" : "text.secondary"}
            href="/stories"
            onClick={(e) => {
              e.preventDefault();
              navigate("/stories");
            }}
          >
            Stories
          </Link>
          {selectedName && (
            <Typography color="text.primary">{selectedName}</Typography>
          )}
        </Breadcrumbs>
      </Toolbar>
      <Divider />
    </AppBar>
  );
};

export default Header;
