import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MessageActions from "./MessageActions";

const ChatMessage = ({
  message,
  dataTable,
  isBot,
  timestamp,
  feedback: initialFeedback,
  messageId,
  sessionId,
  onUpdateFeedback,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState(initialFeedback);

  // Sync local state with prop changes
  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const handleFeedbackChange = (newFeedback) => {
    setFeedback(newFeedback);
  };

  const handleFeedbackSubmit = (payload) => {
    onUpdateFeedback(payload);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: isBot ? "flex-start" : "flex-end",
          gap: 1,
        }}
      >
        {isBot && (
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
        <Paper
          elevation={0}
          sx={{
            maxWidth: "70%",
            p: 1.5,
            borderRadius: 2,
            background: isBot
              ? "rgba(31, 41, 55, 0.8)"
              : "linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.8))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            {message}
          </Typography>
          {dataTable && (
            <Box sx={{ mt: 1 }}>
              {/* Render dataTable if available, e.g., as a table */}
              <pre>{JSON.stringify(dataTable, null, 2)}</pre>
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, mt: 1 }}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </Typography>
        </Paper>
        {!isBot && (
          <Avatar
            sx={{
              bgcolor: theme.palette.secondary.main,
              width: 32,
              height: 32,
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Box>
      {isBot && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-start", mt: 1, ml: "40px" }}
        >
          <MessageActions
            message={message}
            isBot={isBot}
            feedback={feedback}
            onFeedbackChange={handleFeedbackChange}
            onFeedbackSubmit={handleFeedbackSubmit}
            sessionId={sessionId}
            messageId={messageId}
          />
        </Box>
      )}
    </Box>
  );
};

export default ChatMessage;
