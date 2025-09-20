import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import theme from "../../lib/mui/theme";

const DRAWER_WIDTH = 300;

const MainDrawer = () => {
  const drawerContent = (
    <Stack sx={{ height: "100%" }}>
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
          <Typography variant="h6">Apptales</Typography>
        </Toolbar>
      </AppBar>
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Journeys" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box flexGrow={1} />
      <Divider />
    </Stack>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "step" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        open
        slotProps={{
          paper: {
            style: {
              position: "absolute",
            },
          },
        }}
        ModalProps={{
          container: document.getElementById("container"),
          style: { position: "absolute" },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default MainDrawer;
