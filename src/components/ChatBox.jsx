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
import Logo from "../assets/Intelliplan-logo.png";
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
      console.log("Active conversation messages:", activeConversation.messages);
      const formattedMessages = activeConversation.messages.map((msg) => {
        console.log("Processing message:", msg);
        return {
          text: msg.content,
          isBot: msg.role === "assistant",
          timestamp: new Date(),
          isImage: msg.isImage || false,
          imageUrl: msg.imageUrl || null,
          imageFileId: msg.imageFileId || null,
        };
      });
      console.log("Formatted messages for UI:", formattedMessages);
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
            {" "}
            {/* Reduced padding */}
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
          </IconButton>{" "}
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
            <Typography variant="h6" fontWeight="medium" className="text-reveal">
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
            <Fade
              key={index}
              in={true}
              timeout={300}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Accordion
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
            </Fade>
          ))}
        </Box>

        <Box
          sx={{ p: 2, mt: "auto", borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            Need more help?
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            className="hover-lift"
            sx={{
              display: "inline-block",
              cursor: "pointer",
              transition: "color 0.2s ease",
              "&:hover": {
                color: theme.palette.primary.light,
              },
            }}
          >
            Email support@intelliplan.kcc.com
          </Typography>
        </Box>
      </Drawer>

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
          {isChatEmpty && !isBotResponding ? (
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
                        disabled={isBotResponding}
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          ) : (
            renderMessages()
          )}
          {isBotResponding && messages?.length > 0 && (
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
