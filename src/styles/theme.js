import { createTheme } from "@mui/material";

// Enhanced "Midnight Sapphire" design tokens - Ultra Modern Edition
export const designTokens = {
  palette: {
    mode: "dark",
    primary: {
      main: "#60a5fa", // Bright, modern blue
      light: "#93C5FD",
      dark: "#3B82F6",
      contrastText: "#FFFFFF",
      hover: "#3B82F6",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
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
      main: "#60a5fa",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      fontSize: "3rem",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      fontSize: "2.5rem",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      fontSize: "2rem",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.02em",
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.015em",
      fontSize: "1rem",
    },
    subtitle1: {
      letterSpacing: 0,
      fontWeight: 600,
      fontSize: "1rem",
    },
    subtitle2: {
      letterSpacing: 0,
      fontWeight: 500,
      fontSize: "0.875rem",
    },
    body1: {
      letterSpacing: 0,
      lineHeight: 1.7,
      fontSize: "1rem",
    },
    body2: {
      letterSpacing: 0,
      lineHeight: 1.7,
      fontSize: "0.875rem",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "none",
      fontSize: "0.9375rem",
    },
    caption: {
      letterSpacing: 0,
      lineHeight: 1.4,
      fontSize: "0.75rem",
    },
    overline: {
      letterSpacing: "0.08em",
      fontWeight: 700,
      textTransform: "uppercase",
      fontSize: "0.625rem",
    },
    chatMessage: {
      fontSize: "0.9375rem",
      lineHeight: 1.7,
    },
    timestamp: {
      fontSize: "0.6875rem",
    },
  },
  shape: {
    borderRadius: 12,
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
        contained: {
          background: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
          boxShadow: "0 4px 14px rgba(96, 165, 250, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            boxShadow: "0 6px 20px rgba(96, 165, 250, 0.4)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlined: {
          borderWidth: "2px",
          borderColor: "rgba(96, 165, 250, 0.5)",
          "&:hover": {
            borderWidth: "2px",
            borderColor: "rgba(96, 165, 250, 0.8)",
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            transform: "translateY(-2px)",
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
