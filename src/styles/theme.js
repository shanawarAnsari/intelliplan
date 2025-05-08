import { createTheme } from "@mui/material";

// New "Nordic Blue" design tokens
export const designTokens = {
  palette: {
    mode: "dark",
    primary: {
      main: "#5E81AC", // Calm Blue
      dark: "#4C6A8D", // Darker Blue for hover
      contrastText: "#ECEFF4", // Light text for primary elements
    },
    secondary: {
      main: "#81A1C1", // Lighter, complementary blue
    },
    background: {
      default: "#2E3440", // Dark Slate Grey background
      paper: "#3B4252", // Slightly lighter Slate Grey for paper elements
      secondary: "#434C5E", // Even lighter for secondary backgrounds or accents
    },
    text: {
      primary: "#ECEFF4", // Off-white for primary text
      secondary: "#D8DEE9", // Light grey for secondary text
    },
    divider: "rgba(236, 239, 244, 0.12)", // Softer divider, using light text color with alpha
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
    },
    chatMessage: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    timestamp: {
      fontSize: "0.7rem",
    },
  },
  shape: {
    borderRadius: 6, // Slightly softer border radius
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
  },
};

export const appTheme = createTheme(designTokens);
