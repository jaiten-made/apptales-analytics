import { CSSProperties } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Mixins {
    drawer: CSSProperties;
  }
}
