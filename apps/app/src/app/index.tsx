import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../lib/mui/theme";
import MainDrawer from "./components/MainDrawer";
import Journeys from "./features/journeys";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex justify-center">
        <Container id="container" className="absolute h-full" disableGutters>
          <MainDrawer />
          <Box paddingLeft={`${theme.mixins.drawer.minWidth}px`}>
            <Journeys />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
