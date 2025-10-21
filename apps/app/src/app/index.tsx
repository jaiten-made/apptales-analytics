import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import theme from "../lib/mui/theme";
import NavBar from "./components/NavBar";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex flex-col w-full h-screen">
        <NavBar />
        <Box className="flex justify-center grow">
          {/* <MainDrawer /> */}
          <main className="flex flex-col grow h-full">
            <Outlet />
          </main>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
