import { createTheme } from "@mui/material";

const theme = createTheme({
  mixins: {
    drawer: {
      minWidth: 300,
      width: 300,
    },
  },
});

export default theme;
