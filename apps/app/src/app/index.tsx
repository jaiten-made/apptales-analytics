import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Outlet } from "react-router";
import theme from "../lib/mui/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="flex justify-center w-full h-screen">
        {/* <MainDrawer /> */}
        <main className="flex flex-col grow h-full">
          <Outlet />
        </main>
      </Box>
    </ThemeProvider>
  );
}

export default App;
