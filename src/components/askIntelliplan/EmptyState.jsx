/**
 * Empty State Component - Displayed when no messages exist
 */
import React from "react";
import { Box, Typography, Button, useTheme, Fade } from "@mui/material";
import { TipsAndUpdatesOutlined } from "@mui/icons-material";
import { SUGGESTED_PROMPTS } from "../../utils/constants";

const EmptyState = ({ onGetStarted }) => {
  const theme = useTheme();

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          textAlign: "center",
          my: "auto",
          px: 2,
          py: 3,
        }}
      >
        {/* Animated icon with glow effect */}
        <Box
          sx={{
            mb: 2.5,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Outer glow ring */}
          <Box
            sx={{
              position: "absolute",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)",
              animation: "pulse 2.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  opacity: 0.4,
                },
                "50%": {
                  transform: "scale(1.15)",
                  opacity: 0.6,
                },
              },
            }}
          />
          {/* Icon container with gradient */}
          <Box
            sx={{
              position: "relative",
              p: 2,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(96, 165, 250, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(96, 165, 250, 0.2)",
            }}
          >
            <TipsAndUpdatesOutlined
              sx={{
                fontSize: 36,
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
          </Box>
        </Box>

        {/* Title with gradient text */}
        <Typography
          variant="h4"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            background: "linear-gradient(135deg, #14b8b8 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to IntelliPlan
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: theme.palette.text.secondary,
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            maxWidth: "450px",
            mx: "auto",
          }}
        >
          I'm your AI assistant, ready to help you with{" "}
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            data analysis
          </Box>
          ,{" "}
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            insights
          </Box>
          , and{" "}
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            intelligent planning
          </Box>
          .
        </Typography>

        {/* Suggestions section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              color: theme.palette.text.secondary,
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Try asking
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: "650px",
              mx: "auto",
            }}
          >
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => onGetStarted?.(prompt)}
                sx={{
                  borderWidth: "1.5px",
                  borderColor: "rgba(96, 165, 250, 0.3)",
                  color: theme.palette.text.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 0.75,
                  fontSize: "0.75rem",
                  background: "rgba(31, 41, 55, 0.5)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderWidth: "1.5px",
                    borderColor: "rgba(96, 165, 250, 0.5)",
                    background:
                      "linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(96, 165, 250, 0.2)",
                  },
                }}
              >
                {prompt}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default EmptyState;
