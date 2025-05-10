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

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const {
    activeConversation,
    isLoading: isBotResponding,
    sendMessage,
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

    // Use the sendMessage function from context
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
      {/* Header Bar - Reduced padding */}
      <Box
        sx={{
          p: "8px 12px", // Reduced padding from 12px 16px
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
                sx={{ mr: 0.5, color: theme.palette.text.secondary }} // Reduced margin
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <img src={Logo} alt="Kimberly-Clark Logo" height="80" />{" "}
          {/* Reduced height from 28 */}
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
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
            {" "}
            {/* Reduced padding */}
            <Avatar
              sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main }} // Reduced size
            >
              <AccountCircleIcon fontSize="small" /> {/* Added smaller icon */}
            </Avatar>
          </IconButton>{" "}
          <Typography
            variant="body2"
            sx={{
              ml: 0.5,
              fontWeight: "medium",
              color: theme.palette.text.primary,
              fontSize: "0.85rem",
            }} // Smaller margin and text
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
            width: 320,
            bgcolor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="medium">
              Help & Information
            </Typography>
            <IconButton
              onClick={() => setHelpDrawerOpen(false)}
              sx={{ color: theme.palette.text.secondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1} mb={1}>
            Frequently asked questions about this assistant
          </Typography>
        </Box>

        <Box sx={{ p: 1, overflowY: "auto" }}>
          {faqItems.map((item, index) => (
            <Accordion
              key={index}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: "transparent",
                "&:before": { display: "none" },
                borderBottom:
                  index < faqItems.length - 1
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />
                }
                sx={{
                  px: 1.5,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                <Typography fontSize="0.9rem" fontWeight="medium">
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.5, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box
          sx={{ p: 2, mt: "auto", borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            Need more help?
          </Typography>
          <Typography variant="body2" color="primary">
            Email support@intelliplan.example.com
          </Typography>
        </Box>
      </Drawer>

      {/* Chat Content Area */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px", // Kept this the same for readability
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
          {isChatEmpty && !isBotResponding ? (
            <Box sx={{ textAlign: "center", my: "auto" }}>
              <Typography
                variant="h5" // Changed from h4 to h5 for smaller heading
                sx={{
                  mb: 1, // Reduced margin from 2
                  color: theme.palette.text.primary,
                  fontWeight: "medium",
                }}
              >
                How can I assist you today?
              </Typography>
              <Typography
                variant="body2" // Changed from body1 to body2
                sx={{ mb: 3, color: theme.palette.text.secondary }} // Reduced margin from 4
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
                p: 1, // Reduced padding from 2
                mt: 0.5, // Reduced margin from 1
              }}
            >
              <CircularProgress
                size={16} // Reduced size from 20
                sx={{ mr: 1, color: theme.palette.primary.main }} // Reduced margin
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }} // Smaller text
              >
                Agent is thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input at bottom when chat has messages - Reduced padding */}
        {(!isChatEmpty || messages.length > 0) && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            {" "}
            {/* Reduced padding from 2 */}
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
