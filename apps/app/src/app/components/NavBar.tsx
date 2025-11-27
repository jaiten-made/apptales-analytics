import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useSignOutMutation } from "../../lib/redux/api/auth/api";

const NavBar = () => {
  const [signOut] = useSignOutMutation();

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
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
          <Button onClick={() => signOut()} variant="contained">
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
