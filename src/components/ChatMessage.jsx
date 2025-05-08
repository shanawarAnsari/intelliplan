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
        mb: 1, // Reduced from 1.5 to 1
      }}
      className="fade-in"
    >
      <Paper
        elevation={1}
        sx={{
          p: 1,
          px: 3, // Reduced padding from 1.5 to 1.2
          maxWidth: "75%", // Reduced from 80% to 75%
          bgcolor: isBot
            ? theme.palette.background.secondary
            : theme.palette.primary.main,
          color: isBot
            ? theme.palette.text.primary
            : theme.palette.primary.contrastText,
          borderRadius: theme.shape.borderRadius,
          boxShadow: isBot
            ? "0px 1px 3px rgba(0,0,0,0.12)" // Reduced shadow
            : "0px 1px 3px rgba(0,0,0,0.2)", // Reduced shadow
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem", // Slightly smaller font size
            lineHeight: 1.4, // Tighter line height
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
            mt: 0.5, // Reduced from 0.75 to 0.5
            mr: isBot ? 0 : 1,
            ml: isBot ? 1 : 0,
            color: theme.palette.text.secondary,
            fontSize: "0.65rem", // Reduced size from the theme value
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
