import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0087b9", light: "#93C5FD", dark: "#0087b9" },
    secondary: { main: "#A78BFA", light: "#C4B5FD", dark: "#8B5CF6" },
    background: { default: "#111827", paper: "#1F2937" },
    text: { primary: "#F9FAFB", secondary: "#D1D5DB" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 12,
    h6: { fontSize: "0.95rem", fontWeight: 600 },
    body1: { fontSize: "0.744rem" },
    body2: { fontSize: "0.68rem" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-track": { background: "#1F2937" },
          "&::-webkit-scrollbar-thumb": {
            background: "#4B5563",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#60A5FA" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});

export default theme;
