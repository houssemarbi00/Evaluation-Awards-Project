import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0", // bleu professionnel
    },
    secondary: {
      main: "#f57c00", // orange vif
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default theme;
