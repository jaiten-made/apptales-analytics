import { AppBar, Box, Toolbar, Typography } from "@mui/material";

const NavBar = () => {
  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="AppTales Logo"
            sx={{ height: 32, width: 32 }}
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            Apptales
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
