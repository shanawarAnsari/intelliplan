import { createContext } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { appTheme } from "../styles/theme";

// Simple context that no longer needs to toggle themes
export const ThemeContext = createContext({
  mode: "dark",
});

export const ThemeProviderWrapper = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ mode: "dark" }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
