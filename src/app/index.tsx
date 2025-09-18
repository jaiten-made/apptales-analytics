import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../lib/mui/theme";
import MainDrawer from "./components/MainDrawer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainDrawer />
    </ThemeProvider>
  );
}

export default App;
