import { AppBar, Breadcrumbs, Link, Toolbar } from "@mui/material";
import theme from "../../../../lib/mui/theme";

const Header = () => {
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
          <Link underline="none" color="text.primary">
            Journeys
          </Link>
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
