/**
 * Message List Component
 */
import React from "react";
import { Box, Alert, Typography } from "@mui/material";
import ChatMessage from "../ChatMessage";
import LoadingAnimation from "../LoadingAnimation";

const MessageList = ({
  messages,
  error,
  isBotResponding,
  messagesEndRef,
  onUpdateFeedback,
}) => {
  return (
    <>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() => console.log("Error dismissed")}
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
          messageIndex={message.messageIndex}
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
