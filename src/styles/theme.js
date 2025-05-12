import { createTheme, alpha } from "@mui/material";

// "Aetherial Surface - Dark Mode" design tokens
export const designTokens = {
  palette: {
    mode: "dark", // Changed to dark mode
    primary: {
      main: "#64B5F6", // A vibrant, accessible blue for dark mode
      light: alpha("#64B5F6", 0.8),
      dark: alpha("#64B5F6", 0.6),
      contrastText: "#000000", // Text on primary buttons
    },
    secondary: {
      main: "#4DB6AC", // A rich teal for accents
      light: alpha("#4DB6AC", 0.8),
      dark: alpha("#4DB6AC", 0.6),
      contrastText: "#000000",
    },
    background: {
      default: "#121212", // Deep dark grey, main background
      paper: "#1E1E1E", // Slightly lighter grey for primary surfaces (cards, dialogs)
      secondary: "#2C2C2C", // Medium dark grey for secondary surfaces
      tertiary: "#3A3A3A", // Even lighter dark grey for subtle distinctions
      accent: alpha("#64B5F6", 0.1), // Subtle primary accent
    },
    text: {
      primary: "#E0E0E0", // Light grey for primary text
      secondary: "#B0B0B0", // Medium light grey for secondary text
      disabled: "#757575", // Darker grey for disabled text
      hint: "#616161", // Very dark grey for hints
    },
    divider: alpha("#E0E0E0", 0.12), // Subtle light divider
    action: {
      active: alpha("#64B5F6", 0.6), // Primary color with opacity
      hover: alpha("#FFFFFF", 0.08), // Light hover for interactive elements
      selected: alpha("#64B5F6", 0.16), // Slightly more prominent selected state
      disabled: alpha("#E0E0E0", 0.3),
      disabledBackground: alpha("#E0E0E0", 0.12),
      focus: alpha("#64B5F6", 0.24),
    },
    error: {
      main: "#EF9A9A", // Lighter red for dark mode
      light: alpha("#EF9A9A", 0.8),
      dark: alpha("#EF9A9A", 0.6),
      contrastText: "#000000",
    },
    warning: {
      main: "#FFCC80", // Lighter orange
      contrastText: "#000000",
    },
    info: {
      main: "#90CAF9", // Lighter blue
      contrastText: "#000000",
    },
    success: {
      main: "#A5D6A7", // Lighter green
      contrastText: "#000000",
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-0.015em" },
    h2: { fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.005em" },
    h4: { fontSize: "1.5rem", fontWeight: 500 },
    h5: { fontSize: "1.25rem", fontWeight: 500 },
    h6: { fontSize: "1.1rem", fontWeight: 500 },
    subtitle1: { fontSize: "1rem", fontWeight: 400 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
    caption: { fontSize: "0.75rem", fontWeight: 400, color: "#B0B0B0" }, // Adjusted for dark theme
    overline: {
      fontSize: "0.625rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#B0B0B0", // Adjusted for dark theme
    },
    chatMessage: {
      fontSize: "0.925rem",
      lineHeight: 1.55,
      fontWeight: 400,
    },
    timestamp: {
      fontSize: "0.7rem",
      color: "#757575", // Adjusted for dark theme
    },
  },
  shape: {
    borderRadius: 12, // Softer, more modern rounded corners
  },
  shadows: [
    "none",
    "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)", // Dark theme shadows
    "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
    "0px 3px 6px -2px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
    "0px 4px 8px -2px rgba(0,0,0,0.2), 0px 8px 12px 0px rgba(0,0,0,0.14), 0px 2px 20px 0px rgba(0,0,0,0.12)",
    "0px 5px 10px -3px rgba(0,0,0,0.2), 0px 10px 15px 1px rgba(0,0,0,0.14), 0px 3px 24px 2px rgba(0,0,0,0.12)",
    "0px 6px 12px -3px rgba(0,0,0,0.2), 0px 12px 18px 1px rgba(0,0,0,0.14), 0px 4px 28px 2px rgba(0,0,0,0.12)",
    "0px 7px 14px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 32px 3px rgba(0,0,0,0.12)",
    "0px 8px 16px -4px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 36px 3px rgba(0,0,0,0.12)",
    ...Array(16).fill(
      "0px 10px 20px -5px rgba(0,0,0,0.25), 0px 20px 30px 5px rgba(0,0,0,0.2), 0px 8px 40px 5px rgba(0,0,0,0.15)"
    ),
  ],
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)", // Smoother easing
      easeOut: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
      easeIn: "cubic-bezier(0.55, 0.09, 0.68, 0.53)",
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
      styleOverrides: (themeParam) => ({
        body: {
          margin: 0,
          fontFamily: themeParam.typography.fontFamily,
          backgroundColor: themeParam.palette.background.default,
          color: themeParam.palette.text.primary,
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(themeParam.palette.text.primary, 0.5)} ${alpha(
            themeParam.palette.background.paper,
            0.5
          )}`, // Dark theme scrollbar
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: alpha(themeParam.palette.background.paper, 0.5), // Dark theme scrollbar track
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(themeParam.palette.text.primary, 0.3), // Dark theme scrollbar thumb
            borderRadius: "4px",
            "&:hover": {
              background: alpha(themeParam.palette.text.primary, 0.5),
            },
          },
        },
        "*": {
          boxSizing: "border-box",
        },
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      }),
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          padding: "8px 20px",
          transition: theme.transitions.create(
            ["background-color", "box-shadow", "border-color", "color"],
            {
              duration: theme.transitions.duration.short,
            }
          ),
          "&:hover": {
            boxShadow: theme.shadows[2], // Keep subtle lift, shadow color will adapt
          },
        }),
        containedPrimary: ({ theme }) => ({
          "&:hover": {
            backgroundColor: theme.palette.primary.light, // Use light variant for hover
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.5),
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1), // Adjusted alpha for dark theme
          },
        }),
        textPrimary: ({ theme }) => ({
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1), // Adjusted alpha for dark theme
          },
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none", // Ensure no gradient from light theme remains
          transition: theme.transitions.create(["box-shadow", "background-color"], {
            duration: theme.transitions.duration.short,
          }),
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: theme.typography.body1.fontSize,
          borderRadius: theme.shape.borderRadius,
          transition: theme.transitions.create(
            ["border-color", "box-shadow", "background-color"],
            {
              duration: theme.transitions.duration.short,
            }
          ),
          "&.Mui-focused": {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`, // Adjusted alpha for dark theme focus
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.primary.main, 0.7),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: "1px",
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.background.secondary, 0.95), // Lighter surface for tooltip on dark bg
          color: theme.palette.text.primary, // Ensure text is readable
          borderRadius: theme.shape.borderRadius / 2,
          fontSize: theme.typography.caption.fontSize,
          padding: "6px 10px",
          border: `1px solid ${theme.palette.divider}`, // Add a subtle border
        }),
        arrow: ({ theme }) => ({
          color: alpha(theme.palette.background.secondary, 0.95),
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.paper, // Ensure drawer bg matches paper
        }),
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper, // Use paper for AppBar background
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: "transparent",
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: "8px 0",
            backgroundColor: alpha(theme.palette.background.default, 0.5), // Slight background on expansion
          },
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          padding: `0 ${theme.spacing(2)}`,
          minHeight: "48px",
          "&.Mui-expanded": {
            minHeight: "48px",
          },
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }),
        content: ({ theme }) => ({
          margin: `${theme.spacing(1.5)} 0`,
          "&.Mui-expanded": {
            margin: `${theme.spacing(1.5)} 0`,
          },
        }),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(1, 2, 2, 2),
          backgroundColor: "transparent", // Details area transparent to show root expanded bg
          borderBottomLeftRadius: theme.shape.borderRadius,
          borderBottomRightRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.24), // Adjusted hover for selected in dark
            },
          },
        }),
      },
    },
  },
};

export const appTheme = createTheme(designTokens);
