import React, { useState, useEffect, memo } from "react";
import { Box, Typography, Divider, CircularProgress, useTheme } from "@mui/material";

const ThinkingIndicator = memo(
  ({
    text = "Thinking", // Default text
    isSticky = false,
    showSpinner = true,
    lineVariant = "partial", // 'partial' or 'full'
    isDone = false, // Indicates if the process is complete (for "End of response")
  }) => {
    const theme = useTheme();
    const [animatedDots, setAnimatedDots] = useState("");

    useEffect(() => {
      let interval;
      if (!isDone && text === "Thinking" && showSpinner) {
        interval = setInterval(() => {
          setAnimatedDots((dots) => {
            if (dots.length >= 3) return "";
            return dots + ".";
          });
        }, 500); // Animation speed for dots
      } else {
        setAnimatedDots(""); // Clear dots if not thinking or done
      }
      return () => clearInterval(interval);
    }, [isDone, text, showSpinner]);

    const displayText = isDone ? text : `${text}${animatedDots}`;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // This centers the content (dividers, spinner, text) within the ThinkingIndicator Box
          py: isSticky ? 0.75 : 1, // Slightly less padding for sticky
          width: "100%",
          position: isSticky ? "sticky" : "relative",
          top: isSticky ? 0 : "auto",
          zIndex: isSticky ? theme.zIndex.appBar + 1 : "auto", // Ensure sticky is above other content
          backgroundColor: isSticky
            ? `${theme.palette.background.default}e6`
            : "transparent", // Slight transparency for sticky
          backdropFilter: isSticky ? "blur(4px)" : "none",
          borderRadius: isSticky ? "0 0 8px 8px" : "4px",
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
          mt: isSticky ? 0 : 0.5, // Margin top for non-sticky
          mb: 0.5,
        }}
      >
        {lineVariant === "partial" && (
          <Divider
            sx={{
              width: "25%", // Shorter lines for partial
              mr: 1.5,
              borderColor: isDone
                ? theme.palette.primary.light
                : theme.palette.divider,
              opacity: 0.8,
            }}
          />
        )}

        {showSpinner && !isDone && (
          <CircularProgress
            size={14}
            sx={{
              mr: 1,
              color: theme.palette.primary.main, // Use main primary color
            }}
          />
        )}

        {/* Ensure Typography is a direct child for textAlign to work as expected if not already centered by justify-content */}
        <Typography
          variant="caption"
          sx={{
            color: isDone
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
            fontStyle: isDone ? "normal" : "italic",
            fontWeight: isDone ? "medium" : "normal",
            textAlign: "left", // Ensures text inside this Typography component is left-aligned
          }}
        >
          {displayText}
        </Typography>

        {lineVariant === "partial" && (
          <Divider
            sx={{
              width: "25%", // Shorter lines for partial
              ml: 1.5,
              borderColor: isDone
                ? theme.palette.primary.light
                : theme.palette.divider,
              opacity: 0.8,
            }}
          />
        )}

        {/* Full width line is a single divider centered, typically used for "End of response" */}
        {lineVariant === "full" && (
          <Divider
            sx={{
              width: "80%", // Not full 100% to allow some padding feel
              position: "absolute", // Positioned to be behind the text if needed, or just as a line
              left: "10%", // Center it
              borderColor: isDone
                ? theme.palette.primary.main
                : theme.palette.divider,
              opacity: 0.9,
              zIndex: -1, // Ensure it's behind the text if overlapping
              display: isDone ? "block" : "none", // Only show full line when done
            }}
          />
        )}
      </Box>
    );
  }
);

export default ThinkingIndicator;
