import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import theme from "../lib/mui/theme";
import MainDrawer from "./components/MainDrawer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex justify-center w-full">
        <Container
          className="flex m-w-full w-full relative border-r-1"
          sx={{
            borderColor: theme.palette.divider,
          }}
          disableGutters
        >
          <MainDrawer />
          <main className="flex flex-col grow">
            <Outlet />
          </main>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
