import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { formatTime } from "../../../utils/formatters";
import MessageActions from "../MessageActions";
import MessageAvatar from "./MessageAvatar";
import MessageContent from "./MessageContent";
import ErrorBoundary from "../ErrorBoundary";

const ChatMessage = ({
  message,
  dataTable,
  isBot,
  timestamp,
  feedback,
  messageIndex,
  onUpdateFeedback,
}) => {
  const theme = useTheme();
  const handleFeedbackChange = (feedbackType) => {
    if (onUpdateFeedback && messageIndex !== undefined) {
      onUpdateFeedback(messageIndex, feedbackType);
    }
  };

  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: "flex",
          flexDirection: isBot ? "row" : "row-reverse",
          alignItems: "flex-start",
          mb: 2,
          gap: 1,
          animation: isBot
            ? "messageInLeft 0.3s ease-out"
            : "messageInRight 0.3s ease-out",
        }}
      >
        {/* Avatar */}
        <MessageAvatar isBot={isBot} />

        {/* Message Content Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            flex: 1,
            alignItems: isBot ? "flex-start" : "flex-end",
          }}
        >
          {/* Message Bubble */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              maxWidth: { xs: "100%", sm: "85%", md: "75%" },
              background: isBot ? "rgba(31, 41, 55, 0.7)" : "rgba(31, 71, 55, 0.7)",
              backdropFilter: "blur(20px)",
              color: isBot
                ? theme.palette.text.primary
                : theme.palette.primary.contrastText,
              borderRadius: isBot ? "0 12px 12px 12px" : "12px 0 12px 12px",
              border: isBot
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: isBot
                ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                : "0 2px 12px rgba(96, 165, 250, 0.25)",
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
            }}
          >
            <MessageContent text={message} dataTable={dataTable} />
          </Paper>

          {/* Message Actions - Always visible */}
          <Box
            sx={{
              display: "flex",
              justifyContent: isBot ? "flex-start" : "flex-end",
              width: "100%",
            }}
          >
            <MessageActions
              message={message}
              dataTable={dataTable}
              isBot={isBot}
              feedback={feedback}
              onFeedbackChange={handleFeedbackChange}
            />
          </Box>

          {/* Timestamp */}
          {timestamp && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: theme.palette.text.secondary,
                fontSize: "0.625rem",
                fontWeight: 500,
                opacity: 0.6,
              }}
              aria-label={`Message timestamp: ${formatTime(timestamp)}`}
            >
              {formatTime(timestamp)}
            </Typography>
          )}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default ChatMessage;