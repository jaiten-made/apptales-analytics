import { createTheme } from "@mui/material";

const theme = createTheme({
  mixins: {
    drawer: {
      minWidth: 300,
      width: 300,
    },
    appbar: {
      height: 64,
    },
  },
});

export default theme;
