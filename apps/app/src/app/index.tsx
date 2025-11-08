import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import theme from "../lib/mui/theme";
import NavBar from "./components/NavBar";

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/auth/signin");
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex flex-col w-full h-screen">
        {!hideHeader && <NavBar />}
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
