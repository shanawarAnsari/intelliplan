/**
 * ChatBox Component - Refactored
 */
import React, { useState, useRef, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { useConversation } from "../../contexts/ConversationContext";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "../MessageInput";
import EmptyState from "../EmptyState";

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const theme = useTheme();
  const {
    activeConversation,
    isLoading: isBotResponding,
    error,
    sendMessage,
    createNewConversation,
    updateMessageFeedback,
  } = useConversation();

  const messagesEndRef = useScrollToBottom([messages, isBotResponding]);

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      const formattedMessages = activeConversation.messages.map((msg, index) => ({
        text: msg.content,
        isBot: msg.role === "assistant",
        timestamp: msg.timestamp || new Date(),
        feedback: msg.feedback || null,
        messageIndex: index,
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (text) => {
    const userMessage = { text, isBot: false, timestamp: new Date() };
    setMessages([...messages, userMessage]);
    await sendMessage(text);
  };

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    if (window.confirm("Clear this conversation?")) {
      createNewConversation();
      setMessages([]);
    }
  };

  const isChatEmpty = messages.length === 0;

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header with glassmorphism */}
      <ChatHeader
        drawerOpen={drawerOpen}
        onToggleDrawer={onToggleDrawer}
        onClearChat={handleClearChat}
        showClearButton={!isChatEmpty}
      />

      {/* Chat Content Area */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "950px",
          mx: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          px: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Messages area or empty state */}
        <Box
          ref={messagesContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            py: 2,
            display: "flex",
            flexDirection: "column",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(31, 41, 55, 0.3)",
              borderRadius: "3px",
              margin: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background:
                "linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(167, 139, 250, 0.5))",
              borderRadius: "3px",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.8))",
              },
            },
          }}
        >
          {isChatEmpty && !isBotResponding ? (
            <EmptyState onGetStarted={handleQuickPrompt} />
          ) : (
            <MessageList
              messages={messages}
              error={error}
              isBotResponding={isBotResponding}
              messagesEndRef={messagesEndRef}
              onUpdateFeedback={updateMessageFeedback}
            />
          )}
        </Box>

        {/* Input at bottom when chat has messages */}
        {(!isChatEmpty || messages.length > 0) && (
          <Box
            sx={{
              py: 2,
              background:
                "linear-gradient(to top, rgba(10, 15, 28, 0.95) 0%, transparent 100%)",
              backdropFilter: "blur(10px)",
              position: "relative",
            }}
          >
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isBotResponding}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatBox;
