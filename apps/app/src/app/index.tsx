import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import theme from "../lib/mui/theme";
import MainDrawer from "./components/MainDrawer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex justify-center">
        <Container id="container" className="absolute h-full" disableGutters>
          <MainDrawer />
          <Box paddingLeft={`${theme.mixins.drawer.minWidth}px`}>
            {/* Render feature routes here */}
            <Outlet />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
