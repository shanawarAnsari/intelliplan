import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  useTheme,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
} from "@mui/material";
import { useConversation } from "../contexts/ConversationContext";
import MenuIcon from "@mui/icons-material/Menu";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/InteliPlan.jpg";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const {
    activeConversation,
    isLoading: isBotResponding,
    sendMessage,
    createNewConversation,
  } = useConversation();

  // FAQ data for the help drawer
  const faqItems = [
    {
      question: "What can this chatbot do?",
      answer:
        "This AI assistant can help with data analysis, generate insights from your sales data, create forecasts, and answer questions about market trends and performance metrics.",
    },
    {
      question: "How do I start a new conversation?",
      answer:
        "Click on the 'New Conversation' button in the sidebar or simply start typing your question in the message box below.",
    },
    {
      question: "Can I save my conversations?",
      answer:
        "Yes, all conversations are automatically saved in the sidebar. You can access them anytime by clicking on the conversation title.",
    },
    {
      question: "What type of data can I analyze?",
      answer:
        "You can analyze sales data, market trends, customer behavior patterns, product performance, and regional metrics. Simply ask a question about the data you're interested in.",
    },
    {
      question: "How accurate are the forecasts?",
      answer:
        "Forecasts are based on historical data patterns and use advanced predictive models. Accuracy depends on data quality and market stability, but predictions typically include confidence intervals.",
    },
    {
      question: "Can I export the analysis results?",
      answer:
        "Yes, you can ask the assistant to prepare data for export. You'll receive downloadable files with your analysis results when available.",
    },
  ];

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      const formattedMessages = activeConversation.messages.map((msg) => ({
        text: msg.content,
        isBot: msg.role === "assistant",
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (text) => {
    const userMessage = { text, isBot: false, timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    await sendMessage(text);
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
          p: "8px 16px",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {!drawerOpen && (
            <Tooltip title="Open Sidebar">
              <IconButton
                onClick={onToggleDrawer}
                sx={{
                  mr: 1,
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <img
            src={Logo}
            alt="InteliPlan Logo"
            height="36"
            className="hover-lift"
            style={{ borderRadius: "4px" }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Help & FAQ">
            <IconButton
              onClick={toggleHelpDrawer}
              sx={{
                color: theme.palette.text.secondary,
                mr: 1.5,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <HelpOutlineIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <IconButton sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
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
              ml: 1,
              fontWeight: "medium",
              color: theme.palette.text.primary,
            }}
          >
            Ansari, Shanawar Ahmad
          </Typography>
        </Box>
      </Box>

      {/* Help Drawer */}
      <Drawer
        anchor="right"
        open={helpDrawerOpen}
        onClose={() => setHelpDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 360 },
            bgcolor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            Help & Information
          </Typography>
          <IconButton
            onClick={() => setHelpDrawerOpen(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ p: 2, pt: 1, pb: 0 }}
        >
          Frequently asked questions about this assistant.
        </Typography>

        <Box sx={{ p: 1, overflowY: "auto", flexGrow: 1 }}>
          {faqItems.map((item, index) => (
            <Fade
              key={index}
              in={true}
              timeout={300}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Accordion
                defaultExpanded={index === 0}
                sx={{
                  borderBottom:
                    index < faqItems.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                  "&:last-of-type": {
                    borderBottomLeftRadius: theme.shape.borderRadius,
                    borderBottomRightRadius: theme.shape.borderRadius,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />
                  }
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Fade>
          ))}
        </Box>

        <Box
          sx={{
            p: 2,
            mt: "auto",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.secondary,
          }}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            Need more help?
          </Typography>
          <Typography
            variant="body2"
            component="a"
            href="mailto:support@intelliplan.example.com"
            color="primary"
            className="hover-lift"
            sx={{
              textDecoration: "none",
              fontWeight: "medium",
              "&:hover": {
                textDecoration: "underline",
                color: theme.palette.primary.dark,
              },
            }}
          >
            support@intelliplan.example.com
          </Typography>
        </Box>
      </Drawer>

      {/* Chat Content Area */}
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
        {/* Messages area or empty state */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2.5 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isChatEmpty && !isBotResponding ? (
            <Fade in={true} timeout={800}>
              <Box sx={{ textAlign: "center", my: "auto", p: 2 }}>
                <img
                  src={Logo}
                  alt="InteliPlan Logo"
                  style={{
                    width: 80,
                    height: 80,
                    marginBottom: theme.spacing(2),
                    borderRadius: "50%",
                  }}
                />
                <Typography
                  variant="h4"
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
                        disabled={isBotResponding}
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={`msg-${activeConversation?.id}-${index}`}
                message={message.text}
                isBot={message.isBot}
                timestamp={message.timestamp}
                onRegenerateResponse={
                  message.isBot && index === messages.length - 1
                    ? () => {
                        const lastUserMessage = messages
                          .slice(0, index)
                          .filter((m) => !m.isBot)
                          .pop();

                        if (lastUserMessage) {
                          handleSendMessage(lastUserMessage.text);
                        }
                      }
                    : undefined
                }
              />
            ))
          )}
          {isBotResponding && messages?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 1.5,
                mt: 1,
              }}
              className="message-in-left"
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

        {/* Input at bottom - always visible */}
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            // borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: "transparent",
            boxShadow: `0 -2px 5px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isBotResponding}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
