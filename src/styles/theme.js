import { createTheme } from "@mui/material";

// Enhanced "Midnight Sapphire" design tokens
export const designTokens = {
  palette: {
    mode: "dark",
    primary: {
      main: "#0087b9", // Vibrant blue for primary actions
      light: "#93C5FD", // Lighter shade for hover effects
      dark: "#0087b9", // Darker shade for active states
      contrastText: "#FFFFFF", // Pure white text for primary elements
      hover: "#3B82F6", // Custom hover state
    },
    secondary: {
      main: "#A78BFA", // Soft purple for secondary actions
      light: "#C4B5FD", // Light purple
      dark: "#8B5CF6", // Dark purple
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#111827", // Very dark blue/gray for main background
      paper: "#1F2937", // Slightly lighter for surface elements
      secondary: "#374151", // Mid-tone for secondary surfaces
      tertiary: "#4B5563", // Lighter surface for highlights
      accent: "#0F172A", // Dark accent background
    },
    text: {
      primary: "#F9FAFB", // Almost white for primary text
      secondary: "#D1D5DB", // Light gray for secondary text
      hint: "#9CA3AF", // Subtle gray for placeholder text
    },
    divider: "rgba(249, 250, 251, 0.08)", // Very subtle divider
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
    h1: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.015em",
    },
    subtitle1: {
      letterSpacing: 0,
    },
    subtitle2: {
      letterSpacing: 0,
      fontWeight: 500,
    },
    body1: {
      letterSpacing: 0,
    },
    body2: {
      letterSpacing: 0,
    },
    button: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    caption: {
      letterSpacing: 0,
    },
    overline: {
      letterSpacing: "0.05em",
      fontWeight: 600,
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
    borderRadius: 8, // Slightly increased border radius
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
