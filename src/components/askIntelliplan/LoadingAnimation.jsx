/**
 * Loading Animation Component - Shown while bot is thinking
 */
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { prefersReducedMotion } from "../../utils/a11y";

const LoadingAnimation = () => {
  const theme = useTheme();
  const reducedMotion = prefersReducedMotion();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        background: "rgba(31, 41, 55, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        border: "1px solid rgba(96, 165, 250, 0.15)",
        animation: reducedMotion ? "none" : "fadeIn 0.3s ease-out",
        maxWidth: "fit-content",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          p: 0.75,
          borderRadius: "8px",
          background: "rgba(96, 165, 250, 0.08)",
        }}
      >
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              boxShadow: "0 1px 4px rgba(96, 165, 250, 0.3)",
              animation: reducedMotion
                ? "none"
                : `bounce 1.2s infinite ease-in-out ${dot * 0.14}s`,
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
          fontSize: "0.75rem",
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
