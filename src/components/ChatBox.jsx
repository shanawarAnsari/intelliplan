import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/KC_logo_for_dark.png";

const ChatBox = ({
  drawerOpen,
  onToggleDrawer,
  activeConversation,
  setActiveConversation,
}) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      const formattedMessages = activeConversation.messages.map((msg) => ({
        text: msg.content,
        isBot: msg.role === "assistant",
        timestamp: new Date(),
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (text) => {
    const userMessage = { text, isBot: false, timestamp: new Date() };
    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);

    if (activeConversation) {
      const historyMessage = {
        role: "user",
        content: text,
      };

      const updatedConversationMessages = [
        ...(activeConversation.messages || []),
        historyMessage,
      ];

      setActiveConversation({
        ...activeConversation,
        messages: updatedConversationMessages,
      });
    }

    setIsBotResponding(true);

    try {
      const response = await fetchChatbotResponse(text, activeConversation?.id);

      const botText = response.answer || "Sorry, I couldn't get a response.";
      const botResponse = {
        text: botText,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      if (activeConversation) {
        const historyBotMessage = {
          role: "assistant",
          content: botText,
        };

        setActiveConversation((prevConv) => ({
          ...prevConv,
          messages: [...(prevConv.messages || []), historyBotMessage],
        }));
      }
    } catch (error) {
      console.error("Error fetching from chatbot agent:", error);
      const errorResponse = {
        text: "Sorry, I encountered an error trying to reach the agent.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);

      if (activeConversation) {
        const historyErrorMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error trying to reach the agent.",
        };

        setActiveConversation((prevConv) => ({
          ...prevConv,
          messages: [...(prevConv.messages || []), historyErrorMessage],
        }));
      }
    } finally {
      setIsBotResponding(false);
    }
  };

  const fetchChatbotResponse = async (query, conversationId) => {
    console.log("Sending query to API:", query, "ConversationID:", conversationId);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      answer: `This is a mock response to: "${query}".`,
      conversationId: conversationId || "new-conversation-id",
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          p: "12px 16px",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {!drawerOpen && (
            <Tooltip title="Open Sidebar">
              <IconButton
                onClick={onToggleDrawer}
                sx={{ mr: 1, color: theme.palette.text.secondary }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <img src={Logo} alt="Kimberly-Clark Logo" height="28" />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.secondary,
          }}
        >
          <IconButton sx={{ color: theme.palette.text.secondary }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
            >
              <AccountCircleIcon />
            </Avatar>
          </IconButton>{" "}
          <Typography
            variant="body2"
            sx={{ ml: 1, fontWeight: "medium", color: theme.palette.text.primary }}
          >
            Ansari, Shanawar Ahmad
          </Typography>
        </Box>
      </Box>

      {/* Chat Content Area */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages area or empty state */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isChatEmpty && !isBotResponding ? (
            <Box sx={{ textAlign: "center", my: "auto" }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  color: theme.palette.text.primary,
                  fontWeight: "medium",
                }}
              >
                How can I assist you today?
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: theme.palette.text.secondary }}
              >
                Start a new conversation or select one from your history.
              </Typography>

              {messages.length === 0 && (
                <Box sx={{ width: "100%", maxWidth: "600px", mx: "auto" }}>
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={isBotResponding}
                  />
                </Box>
              )}
            </Box>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={`msg-${index}`}
                message={message.text}
                isBot={message.isBot}
                timestamp={message.timestamp}
              />
            ))
          )}
          {isBotResponding && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 2,
                mt: 1,
              }}
            >
              <CircularProgress
                size={20}
                sx={{ mr: 1.5, color: theme.palette.primary.main }}
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Agent is thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input at bottom when chat has messages */}
        {(!isChatEmpty || messages.length > 0) && (
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
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
