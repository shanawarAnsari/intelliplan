import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  useTheme,
  Fade,
} from "@mui/material";
import { useConversation } from "../contexts/ConversationContext";
import MenuIcon from "@mui/icons-material/Menu";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/Intelliplan-logo.png";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpFAQ from "./HelpFAQ";
import { orchestrate } from "../services/AzureOpenAIService";

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const { activeConversation } = useConversation();

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };
  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      const formattedMessages = activeConversation.messages.map((msg) => ({
        text: msg.content,
        isBot: msg.role === "assistant",
        timestamp: new Date(msg.timestamp) || new Date(),
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { text, isBot: false, timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const assistantResponse = await orchestrate(text);
      const assistantMessage = {
        text: assistantResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error communicating with the assistant:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Sorry, there was an error processing your request. Please try again.",
          isBot: true,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;
  const renderMessages = () => {
    return messages.map((message, index) => (
      <ChatMessage
        key={`msg-${index}`}
        message={message.text}
        isBot={message.isBot}
        timestamp={message.timestamp}
        isImage={message.isImage}
        imageUrl={message.imageUrl}
        imageFileId={message.imageFileId}
        assistantName={message.assistantName}
        routedFrom={message.routedFrom}
        onRegenerateResponse={
          message.isBot
            ? () => {
                // Find the last user message before this bot message
                const lastUserMessageIndex = messages
                  .slice(0, index)
                  .map((m, i) => ({ ...m, index: i }))
                  .filter((m) => !m.isBot)
                  .pop();

                if (lastUserMessageIndex) {
                  handleSendMessage(messages[lastUserMessageIndex.index].text);
                }
              }
            : undefined
        }
      />
    ));
  };

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
      {/* Header Bar - Reduced padding */}
      <Box
        sx={{
          p: "8px 12px", // Reduced padding from 12px 16px
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", // Subtle shadow
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {!drawerOpen && (
            <Tooltip title="Open Sidebar">
              <IconButton
                onClick={onToggleDrawer}
                sx={{
                  mr: 0.5,
                  color: theme.palette.text.secondary,
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: theme.palette.text.primary,
                  },
                }} // Reduced margin
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <img src={Logo} alt="InteliPlan Logo" height="35" className="hover-lift" />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.secondary,
          }}
        >
          <Tooltip title="Help & FAQ">
            <IconButton
              onClick={toggleHelpDrawer}
              sx={{
                color: theme.palette.text.secondary,
                mr: 1.5,
                transition: "color 0.2s ease",
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: theme.palette.primary.main,
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }} // Reduced size
            >
              <AccountCircleIcon fontSize="small" /> {/* Added smaller icon */}
            </Avatar>
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              ml: 0.5,
              fontWeight: "medium",
              color: theme.palette.text.primary,
              fontSize: "0.85rem",
            }} // Smaller margin and text
          ></Typography>
        </Box>
      </Box>
      {/* Help Drawer */}
      <HelpFAQ open={helpDrawerOpen} onClose={() => setHelpDrawerOpen(false)} />
      {/* Chat Content Area */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px", // Kept this the same for readability
          mx: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages area or empty state - Reduced padding */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2, // Reduced padding from 3
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isChatEmpty && !isLoading ? (
            <Fade in={true} timeout={800}>
              <Box sx={{ textAlign: "center", my: "auto" }}>
                <img
                  src={Logo}
                  alt="InteliPlan Logo"
                  style={{
                    width: 180,
                    height: 40,
                    marginBottom: theme.spacing(2),
                  }}
                />
                <Typography
                  variant="h5" // Changed from h4 to h5 for smaller heading
                  sx={{
                    mb: 1, // Reduced margin from 2
                    color: theme.palette.text.primary,
                    fontWeight: "medium",
                  }}
                  className="text-reveal"
                >
                  How can I assist you today?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "#a5a5a5" }}
                  className="text-reveal"
                >
                  Ask a question, analyze data, or select a conversation from
                  history.
                </Typography>

                {messages.length === 0 && (
                  <Fade
                    in={true}
                    timeout={1000}
                    style={{ transitionDelay: "300ms" }}
                  >
                    <Box sx={{ width: "100%", maxWidth: "600px", mx: "auto" }}>
                      <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isLoading}
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          ) : (
            renderMessages()
          )}
          {isLoading && messages?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 1, // Reduced padding from 2
                mt: 0.5, // Reduced margin from 1
              }}
              className="message-in-left"
            >
              <CircularProgress
                size={16} // Reduced size from 20
                sx={{ mr: 1, color: theme.palette.primary.main }} // Reduced margin
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }} // Smaller text
              >
                {messages?.length > 0 && "Generating response..."}
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input at bottom when chat has messages - Reduced padding */}
        {(!isChatEmpty || messages.length > 0) && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatBox;
