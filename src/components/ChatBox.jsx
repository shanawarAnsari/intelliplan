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
import DomainCards from "./DomainCards"; // Import the new component
import Logger from "./Logger"; // Import the Logger component

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]); // State for logger
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
        assistantName: msg.assistantName,
        routedFrom: msg.routedFrom,
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
    setProgressLogs([]); // Clear previous logs

    const onProgressUpdate = (progress) => {
      setProgressLogs((prevLogs) => [...prevLogs, progress.text]);
    };

    try {
      // Pass onProgressUpdate to orchestrate
      const assistantResponse = await orchestrate(text, onProgressUpdate);
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
      // Do not clear logs here, let the Logger component manage its visibility
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;

  const renderMessages = () => {
    return messages.map((message, index) => (
      <React.Fragment key={`msg-frag-${index}`}>
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
        {/* Render Logger component after user message if loading or if logs exist */}
        {!message.isBot &&
          (isLoading || progressLogs.length > 0) &&
          index === messages.length - 1 && (
            <Box
              sx={{ width: "100%", maxWidth: "700px", mx: "auto", mt: 0.5, mb: 1 }}
            >
              <Logger logs={progressLogs} isLoading={isLoading} />
            </Box>
          )}
      </React.Fragment>
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
      <Box
        sx={{
          p: "8px 12px",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
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
                }}
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
              }}
            >
              <AccountCircleIcon fontSize="small" />
            </Avatar>
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              ml: 0.5,
              fontWeight: "medium",
              color: theme.palette.text.primary,
              fontSize: "0.85rem",
            }}
          ></Typography>
        </Box>
      </Box>

      <HelpFAQ open={helpDrawerOpen} onClose={() => setHelpDrawerOpen(false)} />

      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          mx: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isChatEmpty && !isLoading ? (
            <>
              {" "}
              <Box
                sx={{ width: "100%", maxWidth: "700px", mx: "auto", mt: 2, }}
              >
                <DomainCards />
              </Box>
              <Fade in={true} timeout={800}>
                {/* Render DomainCards instead of the MessageInput here when chat is empty */}
                <Box
                  sx={{
                    textAlign: "center",
                    my: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
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
                    variant="h5"
                    sx={{
                      mb: 1,
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
            </>
          ) : (
            renderMessages()
          )}
          {isLoading && messages?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 1,
                mt: 0.5,
              }}
              className="message-in-left"
            >
              <CircularProgress
                size={16}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}
              >
                {messages?.length > 0 && "Generating response..."}
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

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
