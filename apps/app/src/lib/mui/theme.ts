import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFBF00",
    },
  },
  mixins: {
    drawer: {
      minWidth: 300,
      width: 300,
    },
    appbar: {
      height: 64,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "outlined",
        disableElevation: true
      },
    },
  },
});

export default theme;
