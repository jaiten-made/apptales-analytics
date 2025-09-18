import {
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

const DRAWER_WIDTH = 300;

const MainDrawer = () => {
  const drawerContent = (
    <Stack sx={{ height: "100%" }}>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" color="inherit">
            Apptales
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
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
