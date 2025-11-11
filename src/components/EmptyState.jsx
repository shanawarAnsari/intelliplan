/**
 * Empty State Component - Displayed when no messages exist
 */
import React from "react";
import { Box, Typography, Button, useTheme, Fade } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { SUGGESTED_PROMPTS } from "../utils/constants";

const EmptyState = ({ onGetStarted }) => {
  const theme = useTheme();

  return (
    <Fade in={true} timeout={1000}>
      <Box
        sx={{
          textAlign: "center",
          my: "auto",
          px: 3,
          py: 5,
        }}
      >
        {/* Animated icon with glow effect */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Outer glow ring */}
          <Box
            sx={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  opacity: 0.5,
                },
                "50%": {
                  transform: "scale(1.2)",
                  opacity: 0.8,
                },
              },
            }}
          />
          {/* Icon container with gradient */}
          <Box
            sx={{
              position: "relative",
              p: 3,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(96, 165, 250, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(96, 165, 250, 0.3)",
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{
                fontSize: 56,
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            {/* Sparkle icon */}
            <AutoAwesomeIcon
              sx={{
                position: "absolute",
                top: "10%",
                right: "10%",
                fontSize: 20,
                color: "#60a5fa",
                animation: "sparkle 2s ease-in-out infinite",
                "@keyframes sparkle": {
                  "0%, 100%": {
                    opacity: 0.3,
                    transform: "rotate(0deg) scale(0.8)",
                  },
                  "50%": {
                    opacity: 1,
                    transform: "rotate(180deg) scale(1.2)",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Title with gradient text */}
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.125rem", md: "2.5rem" },
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
          }}
        >
          Welcome to IntelliPlan
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            mb: 5,
            color: theme.palette.text.secondary,
            fontSize: "1.0625rem",
            lineHeight: 1.7,
            maxWidth: "500px",
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
              color: theme.palette.secondary.main,
              fontWeight: 600,
            }}
          >
            insights
          </Box>
          , and{" "}
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.light,
              fontWeight: 600,
            }}
          >
            intelligent planning
          </Box>
          . Start a conversation to explore what I can do for you.
        </Typography>

        {/* Suggestions section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2.5,
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
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
              gap: 1.5,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outlined"
                size="medium"
                onClick={() => onGetStarted?.(prompt)}
                sx={{
                  borderWidth: "2px",
                  borderColor: "rgba(96, 165, 250, 0.3)",
                  color: theme.palette.text.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 3,
                  py: 1.25,
                  fontSize: "0.875rem",
                  background: "rgba(31, 41, 55, 0.5)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderWidth: "2px",
                    borderColor: "rgba(96, 165, 250, 0.6)",
                    background:
                      "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(96, 165, 250, 0.25)",
                  },
                  "&:active": {
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {prompt}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Bottom decorative element */}
        <Box
          sx={{
            mt: 5,
            mx: "auto",
            width: "200px",
            height: "4px",
            borderRadius: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), rgba(167, 139, 250, 0.5), transparent)",
            animation: "shimmerLine 3s ease-in-out infinite",
            "@keyframes shimmerLine": {
              "0%": {
                opacity: 0.3,
              },
              "50%": {
                opacity: 1,
              },
              "100%": {
                opacity: 0.3,
              },
            },
          }}
        />
      </Box>
    </Fade>
  );
};

export default EmptyState;
