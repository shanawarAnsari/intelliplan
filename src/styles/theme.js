import { createTheme } from "@mui/material";

// Enhanced "Midnight Sapphire" design tokens - Ultra Modern Edition
export const designTokens = {
  palette: {
    mode: "dark",
    primary: {
      main: "#14b8b8", // Bright, modern blue
      light: "#6cc0c0",
      dark: "##1a8b8b",
      contrastText: "#FFFFFF",
      hover: "#1a8b8b",
      gradient: "linear-gradient(135deg, #14b8b8 0%, #1a8b8b 100%)",
    },
    secondary: {
      main: "#A78BFA", // Elegant purple
      light: "#C4B5FD",
      dark: "#8B5CF6",
      contrastText: "#FFFFFF",
      gradient: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    },
    background: {
      default: "#0a0f1c", // Deep, rich dark background
      paper: "rgba(31, 41, 55, 0.7)", // Glassmorphism paper
      secondary: "rgba(55, 65, 81, 0.6)",
      tertiary: "rgba(75, 85, 99, 0.5)",
      accent: "#0F172A",
      glass: "rgba(31, 41, 55, 0.7)",
      glassLight: "rgba(31, 41, 55, 0.4)",
      gradient: "linear-gradient(135deg, #0a0f1c 0%, #1a1f35 50%, #0d1526 100%)",
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      hint: "#9CA3AF",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    },
    divider: "rgba(249, 250, 251, 0.06)",
    action: {
      active: "#60A5FA",
      hover: "rgba(96, 165, 250, 0.1)",
      selected: "rgba(96, 165, 250, 0.2)",
      disabled: "rgba(249, 250, 251, 0.3)",
      disabledBackground: "rgba(249, 250, 251, 0.05)",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    },
    info: {
      main: "#14b8b8",
      gradient: "linear-gradient(135deg, #14b8b8 0%, #1a8b8b 100%)",
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
    "0px 2px 4px rgba(0, 0, 0, 0.1)",
    "0px 4px 8px rgba(0, 0, 0, 0.15)",
    "0px 8px 16px rgba(0, 0, 0, 0.2)",
    "0px 12px 24px rgba(0, 0, 0, 0.25)",
    "0px 16px 32px rgba(0, 0, 0, 0.3)",
    // Glow shadows with color
    "0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.1)",
    "0 0 30px rgba(96, 165, 250, 0.4), 0 0 60px rgba(96, 165, 250, 0.2)",
    "0 0 40px rgba(96, 165, 250, 0.5), 0 0 80px rgba(96, 165, 250, 0.3)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          fontFamily:
            '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(31, 41, 55, 0.3)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background:
              "linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(167, 139, 250, 0.5))",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background:
              "linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.8))",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
          padding: "10px 24px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
            boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.2)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(96, 165, 250, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
          background: "rgba(31, 41, 55, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
        },
        elevation3: {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(96, 165, 250, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover fieldset": {
              borderColor: "rgba(96, 165, 250, 0.6)",
              borderWidth: "2px",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#60a5fa",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: 10,
          "&:hover": {
            backgroundColor: "rgba(96, 165, 250, 0.15)",
            transform: "scale(1.1)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
            boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.2)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "4px 0",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            transform: "translateX(4px)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(96, 165, 250, 0.2)",
            borderLeft: "3px solid #60a5fa",
            "&:hover": {
              backgroundColor: "rgba(96, 165, 250, 0.25)",
            },
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "-2px",
            boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.2)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "rgba(31, 41, 55, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 8,
          fontSize: "0.8125rem",
          padding: "8px 12px",
        },
      },
    },
  },
};

export const appTheme = createTheme(designTokens);
