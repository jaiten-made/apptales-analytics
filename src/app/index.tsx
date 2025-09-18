import { Button, ThemeProvider } from "@mui/material";
import theme from "../lib/mui/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button variant="contained">Hello World</Button>
    </ThemeProvider>
  );
}

export default App;
