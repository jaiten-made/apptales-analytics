import { createTheme } from "@mui/material";

export const theme = createTheme({
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
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        style: { textTransform: "capitalize", borderRadius: 25 },
      },
    },
  },
});
