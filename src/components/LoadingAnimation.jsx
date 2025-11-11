/**
 * Loading Animation Component - Shown while bot is thinking
 */
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { prefersReducedMotion } from "../utils/a11y";

const LoadingAnimation = () => {
  const theme = useTheme();
  const reducedMotion = prefersReducedMotion();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2.5,
        background: "rgba(31, 41, 55, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(96, 165, 250, 0.2)",
        animation: reducedMotion
          ? "none"
          : "fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        maxWidth: "fit-content",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          alignItems: "center",
          p: 1,
          borderRadius: "12px",
          background: "rgba(96, 165, 250, 0.1)",
        }}
      >
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              boxShadow: "0 2px 8px rgba(96, 165, 250, 0.4)",
              animation: reducedMotion
                ? "none"
                : `bounce 1.4s infinite ease-in-out ${dot * 0.16}s`,
              "@keyframes bounce": {
                "0%, 80%, 100%": {
                  opacity: 0.3,
                  transform: "scale(0.8)",
                },
                "40%": {
                  opacity: 1,
                  transform: "scale(1.2)",
                },
              },
            }}
          />
        ))}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 600,
          fontSize: "0.9375rem",
          background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Agent is thinking...
      </Typography>
    </Box>
  );
};

export default LoadingAnimation;
