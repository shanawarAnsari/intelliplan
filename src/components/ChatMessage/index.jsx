/**
 * ChatMessage Component - Refactored
 */
import React, { useState } from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { formatTime } from "../../utils/formatters";
import MessageActions from "../MessageActions";
import MessageAvatar from "./MessageAvatar";
import MessageContent from "./MessageContent";
import ErrorBoundary from "../ErrorBoundary";

const ChatMessage = ({ message, isBot, timestamp }) => {
  const theme = useTheme();
  const [hoveredMessage, setHoveredMessage] = useState(false);

  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isBot ? "flex-start" : "flex-end",
          mb: 3,
          animation: isBot
            ? "messageInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            : "messageInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={() => setHoveredMessage(true)}
        onMouseLeave={() => setHoveredMessage(false)}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
            justifyContent: isBot ? "flex-start" : "flex-end",
            mb: 0.5,
            gap: 1.5,
          }}
        >
          {isBot && <MessageAvatar isBot={isBot} />}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: 1,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                maxWidth: { xs: "85%", sm: "75%", md: "65%" },
                background: isBot
                  ? "rgba(31, 41, 55, 0.7)"
                  : "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
                backdropFilter: "blur(20px)",
                color: isBot
                  ? theme.palette.text.primary
                  : theme.palette.primary.contrastText,
                borderRadius: isBot ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                border: isBot
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: isBot
                  ? "0 4px 16px rgba(0, 0, 0, 0.1)"
                  : "0 4px 20px rgba(96, 165, 250, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                wordBreak: "break-word",
                position: "relative",
                overflow: "hidden",
                "&::before": !isBot
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)",
                      pointerEvents: "none",
                    }
                  : {},
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isBot
                    ? "0 8px 24px rgba(0, 0, 0, 0.15)"
                    : "0 8px 32px rgba(96, 165, 250, 0.4)",
                },
              }}
            >
              <MessageContent text={message} />
            </Paper>

            {/* Message Actions - Show on hover with smooth animation */}
            {hoveredMessage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isBot ? "flex-start" : "flex-end",
                  pl: isBot ? 5.5 : 0,
                  pr: isBot ? 0 : 5.5,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <MessageActions message={message} isBot={isBot} />
              </Box>
            )}
          </Box>

          {!isBot && <MessageAvatar isBot={isBot} />}
        </Box>

        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              color: theme.palette.text.secondary,
              fontSize: "0.6875rem",
              fontWeight: 500,
              alignSelf: isBot ? "flex-start" : "flex-end",
              ml: isBot ? 5.5 : 0,
              mr: isBot ? 0 : 5.5,
              opacity: 0.7,
              transition: "opacity 0.3s ease",
              "&:hover": {
                opacity: 1,
              },
            }}
            aria-label={`Message timestamp: ${formatTime(timestamp)}`}
          >
            {formatTime(timestamp)}
          </Typography>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default ChatMessage;
