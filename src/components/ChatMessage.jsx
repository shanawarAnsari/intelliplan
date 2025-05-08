import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";

const ChatMessage = ({ message, isBot, timestamp }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        mb: 1.5,
      }}
      className="fade-in"
    >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          maxWidth: "80%",
          bgcolor: isBot
            ? theme.palette.background.secondary
            : theme.palette.primary.main, // Updated bot and user message background
          color: isBot
            ? theme.palette.text.primary
            : theme.palette.primary.contrastText, // Updated text colors
          borderRadius: theme.shape.borderRadius,
          boxShadow: isBot
            ? "0px 2px 5px rgba(0,0,0,0.15)" // Slightly adjusted shadow for new theme
            : "0px 2px 5px rgba(0,0,0,0.25)", // Slightly adjusted shadow for new theme
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            fontSize: theme.typography.chatMessage.fontSize,
          }}
        >
          {message}
        </Typography>
      </Paper>
      {timestamp && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.75,
            mr: isBot ? 0 : 1,
            ml: isBot ? 1 : 0,
            color: theme.palette.text.secondary, // Updated timestamp color
            fontSize: theme.typography.timestamp.fontSize,
          }}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </Typography>
      )}
    </Box>
  );
};

export default ChatMessage;
