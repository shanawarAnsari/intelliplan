/**
 * Message List Component
 */
import React, { useState, useEffect } from "react";
import { Box, Alert, Typography } from "@mui/material";
import ChatMessage from "../ChatMessage";
import LoadingAnimation from "../LoadingAnimation";

const MessageList = ({
  messages,
  error,
  isBotResponding,
  messagesEndRef,
  onUpdateFeedback,
  sessionId, // Add this prop
}) => {
  const [showError, setShowError] = useState(false);

  // Show error when it changes
  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setShowError(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      {showError && error && (
        <Alert
          severity="error"
          onClose={handleCloseError}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            borderRadius: 0,
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <ChatMessage
          key={`msg-${index}`}
          message={message.text}
          dataTable={message.dataTable}
          isBot={message.isBot}
          timestamp={message.timestamp}
          feedback={message.feedback}
          messageId={message.id} // Pass message ID instead of index
          sessionId={sessionId}
          onUpdateFeedback={onUpdateFeedback}
        />
      ))}

      {/* Loading Animation */}
      {isBotResponding && messages?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mt: 1,
          }}
        >
          <LoadingAnimation />
        </Box>
      )}

      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
