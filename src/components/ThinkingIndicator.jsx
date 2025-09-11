import React, { useState, useEffect, memo } from "react";
import { Box, Typography, Divider, CircularProgress, useTheme } from "@mui/material";

const ThinkingIndicator = memo(
  ({
    text = "Thinking",
    isSticky = false,
    showSpinner = true,
    lineVariant = "partial",
    isDone = false,
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
        }, 500);
      } else {
        setAnimatedDots("");
      }
      return () => clearInterval(interval);
    }, [isDone, text, showSpinner]);

    const displayText = isDone ? text : `${text}${animatedDots}`;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: isSticky ? 0.75 : 1,
          width: "100%",
          position: isSticky ? "sticky" : "relative",
          top: isSticky ? 0 : "auto",
          zIndex: isSticky ? theme.zIndex.appBar + 1 : "auto",
          backgroundColor: isSticky
            ? `${theme.palette.background.default}e6`
            : "transparent",
          backdropFilter: isSticky ? "blur(4px)" : "none",
          borderRadius: isSticky ? "0 0 8px 8px" : "4px",
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
          mt: isSticky ? 0 : 0.5,
          mb: 0.5,
        }}
      >
        {lineVariant === "partial" && (
          <Divider
            sx={{
              width: "25%",
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
              color: theme.palette.primary.main,
            }}
          />
        )}

        { }
        <Typography
          variant="caption"
          sx={{
            color: isDone
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
            fontStyle: isDone ? "normal" : "italic",
            fontWeight: isDone ? "medium" : "normal",
            textAlign: "left",
          }}
        >
          {displayText}
        </Typography>

        {lineVariant === "partial" && (
          <Divider
            sx={{
              width: "25%",
              ml: 1.5,
              borderColor: isDone
                ? theme.palette.primary.light
                : theme.palette.divider,
              opacity: 0.8,
            }}
          />
        )}

        { }
        {lineVariant === "full" && (
          <Divider
            sx={{
              width: "80%",
              position: "absolute",
              left: "10%",
              borderColor: isDone
                ? theme.palette.primary.main
                : theme.palette.divider,
              opacity: 0.9,
              zIndex: -1,
              display: isDone ? "block" : "none",
            }}
          />
        )}
      </Box>
    );
  }
);

export default ThinkingIndicator;
