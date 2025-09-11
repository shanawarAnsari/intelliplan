import { createTheme } from "@mui/material";


export const designTokens = {
  palette: {
    mode: "dark",
    primary: {
      main: "#0087b9",
      light: "#93C5FD",
      dark: "#0087b9",
      contrastText: "#FFFFFF",
      hover: "#3B82F6",
    },
    secondary: {
      main: "#A78BFA",
      light: "#C4B5FD",
      dark: "#8B5CF6",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#111827",
      paper: "#1F2937",
      secondary: "#374151",
      tertiary: "#4B5563",
      accent: "#0F172A",
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      hint: "#9CA3AF",
    },
    divider: "rgba(249, 250, 251, 0.08)",
    action: {
      active: "#60A5FA",
      hover: "rgba(96, 165, 250, 0.08)",
      selected: "rgba(96, 165, 250, 0.16)",
      disabled: "rgba(249, 250, 251, 0.3)",
      disabledBackground: "rgba(249, 250, 251, 0.05)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 12,
    h1: {
      fontSize: "2.125rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.7rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.275rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h4: {
      fontSize: "1.06rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontSize: "0.935rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h6: {
      fontSize: "0.85rem",
      fontWeight: 600,
      letterSpacing: "-0.015em",
    },
    body1: {
      fontSize: "0.744rem",
      letterSpacing: 0,
    },
    body2: {
      fontSize: "0.68rem",
      letterSpacing: 0,
    },
    subtitle1: {
      fontSize: "0.744rem",
      letterSpacing: 0,
    },
    subtitle2: {
      fontSize: "0.68rem",
      letterSpacing: 0,
      fontWeight: 500,
    },
    button: {
      fontSize: "0.744rem",
      fontWeight: 500,
      letterSpacing: 0,
    },
    caption: {
      fontSize: "0.638rem",
      letterSpacing: 0,
    },
    overline: {
      fontSize: "0.595rem",
      letterSpacing: "0.05em",
      fontWeight: 600,
    },
    chatMessage: {
      fontSize: "0.723rem",
      lineHeight: 1.6,
    },
    timestamp: {
      fontSize: "0.553rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 1px 2px rgba(0, 0, 0, 0.25)",
    "0px 2px 4px rgba(0, 0, 0, 0.25)",
    "0px 3px 6px rgba(0, 0, 0, 0.25)",
    "0px 4px 8px rgba(0, 0, 0, 0.25)",
    "0px 5px 10px rgba(0, 0, 0, 0.25)",
    "0px 6px 12px rgba(0, 0, 0, 0.25)",
    "0px 7px 14px rgba(0, 0, 0, 0.25)",
    "0px 8px 16px rgba(0, 0, 0, 0.25)",
    "0px 9px 18px rgba(0, 0, 0, 0.25)",
    "0px 10px 20px rgba(0, 0, 0, 0.25)",
    "0px 11px 22px rgba(0, 0, 0, 0.25)",
    "0px 12px 24px rgba(0, 0, 0, 0.25)",
    "0px 13px 26px rgba(0, 0, 0, 0.25)",
    "0px 14px 28px rgba(0, 0, 0, 0.25)",
    "0px 15px 30px rgba(0, 0, 0, 0.25)",
    "0px 16px 32px rgba(0, 0, 0, 0.25)",
    "0px 17px 34px rgba(0, 0, 0, 0.25)",
    "0px 18px 36px rgba(0, 0, 0, 0.25)",
    "0px 19px 38px rgba(0, 0, 0, 0.25)",
    "0px 20px 40px rgba(0, 0, 0, 0.25)",
    "0px 21px 42px rgba(0, 0, 0, 0.25)",
    "0px 22px 44px rgba(0, 0, 0, 0.25)",
    "0px 23px 46px rgba(0, 0, 0, 0.25)",
    "0px 24px 48px rgba(0, 0, 0, 0.25)",
  ],
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#1F2937",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4B5563",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#60A5FA",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        },
      },
    },
  },
};

export const appTheme = createTheme(designTokens);
