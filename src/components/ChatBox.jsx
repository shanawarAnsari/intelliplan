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
  Button,
} from "@mui/material";
import { useConversation } from "../contexts/ConversationContext";
import useAzureOpenAI from "../services/useAzureOpenAI";
import MenuIcon from "@mui/icons-material/Menu";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/Intelliplan-logo.png";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpFAQ from "./HelpFAQ";

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const {
    activeConversation,
    isLoading: isBotResponding,
    sendMessage,
    addAssistantMessageToConversation,
  } = useConversation();
  const { handleSpecializedAssistantRouting } = useAzureOpenAI();

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      console.log("Active conversation messages:", activeConversation.messages);
      const formattedMessages = activeConversation.messages.map((msg) => {
        console.log("Processing message:", msg);
        // Enhanced debugging for specialized assistant responses
        if (msg.assistantName === "Forecast" || msg.assistantName === "Sales") {
          console.log("⭐ Found specialized assistant message:", {
            content: msg.content,
            assistant: msg.assistantName,
            routedFrom: msg.routedFrom,
          });
        }

        return {
          text: msg.content,
          isBot: msg.role === "assistant",
          timestamp: new Date(msg.timestamp) || new Date(),
          isImage: msg.isImage || false,
          imageUrl: msg.imageUrl || null,
          imageFileId: msg.imageFileId || null,
          assistantName:
            msg.assistantName || (msg.role === "assistant" ? "Assistant" : null),
          routedFrom: msg.routedFrom || null,
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

    try {
      // Use the sendMessage function from context
      const response = await sendMessage(text);
      console.log("Response received:", response);

      if (response) {
        // Check if this is already a specialized assistant response
        if (
          response.routedFrom ||
          response.assistantName === "Forecast" ||
          response.assistantName === "Sales"
        ) {
          // This is already a specialized response from the conversationHandler
          const specializedMessage = {
            text: response.answer,
            isBot: true,
            timestamp: new Date(),
            assistantName: response.assistantName,
            routedFrom: response.routedFrom,
          };

          console.log(
            "Showing specialized assistant response from conversation handler:",
            specializedMessage
          );
          setMessages((prevMessages) => [...prevMessages, specializedMessage]);
          return;
        }

        const botMessage = {
          text: response.answer,
          isBot: true,
          timestamp: new Date(),
          assistantName: response.assistantName || "Assistant",
          routedFrom: response.routedFrom || null,
        };

        // If this is a routing message and there's no specialized assistant response yet,
        // automatically route to the specialized assistant
        if (
          (response.answer.includes("will process your query") ||
            response.answer.includes("routing to Forecast") ||
            response.answer.includes("routing to Sales") ||
            response.answer.includes("The Forecast Assistant") ||
            response.answer.includes("The Sales Assistant")) &&
          !response.routedFrom
        ) {
          // Show temporary routing message
          const routingMessage = {
            ...botMessage,
            isRoutingMessage: true,
          };

          setMessages((prevMessages) => [...prevMessages, routingMessage]);

          // Add a small delay to simulate waiting for the specialized assistant
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Detect which specialized assistant to use
          const assistantType =
            response.answer.includes("Forecast") ||
            response.answer.includes("forecast")
              ? "Forecast"
              : response.answer.includes("Sales") ||
                response.answer.includes("sales")
              ? "Sales"
              : null;

          console.log(`Detected routing instruction to ${assistantType} assistant`);

          if (assistantType) {
            try {
              console.log(
                `Trying to get ${assistantType} assistant response directly...`
              );
              // Use the handleSpecializedAssistantRouting function from the hook
              const specializedResponse = await handleSpecializedAssistantRouting(
                response.conversationId,
                text,
                assistantType
              );

              // Log the specialized response so we can see its structure
              console.log(`Received specialized response:`, specializedResponse);

              // Check if we have a valid response (with or without the success flag)
              if (
                specializedResponse &&
                (specializedResponse.success || specializedResponse.answer)
              ) {
                // Show the specialized assistant response
                const specializedMessage = {
                  text: specializedResponse.answer,
                  isBot: true,
                  timestamp: new Date(),
                  assistantName: assistantType,
                  routedFrom: "Coordinator",
                };

                console.log(
                  `Creating specialized message for UI:`,
                  specializedMessage
                );

                // Replace the routing message with the actual specialized response
                setMessages((prevMessages) => {
                  // Get all messages except the last one (which is the routing message)
                  const messagesWithoutRouting = prevMessages.slice(0, -1);
                  return [...messagesWithoutRouting, specializedMessage];
                });
                // Add the specialized response to the conversation history
                if (activeConversation) {
                  // Use the addAssistantMessageToConversation function to update the conversation
                  addAssistantMessageToConversation(
                    specializedResponse.answer,
                    assistantType,
                    "Coordinator"
                  );

                  console.log("Added specialized response to conversation history");
                }

                return; // Exit early since we've already shown the message
              }
            } catch (err) {
              console.error("Error getting specialized assistant response:", err);
            }
          }
        }

        // Standard flow - just add the response message
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message to user
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Sorry, there was an error processing your request. Please try again.",
          isBot: true,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  // Debug function to directly route to a specialized assistant
  const handleDirectRouting = async (assistantType, message) => {
    try {
      const userMessage = messages.filter((msg) => !msg.isBot).pop();
      if (!userMessage) return;

      const text = userMessage.text;
      console.log(`Directly routing to ${assistantType} with message: ${text}`);

      // Show loading indicator
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `Routing directly to ${assistantType} Assistant...`,
          isBot: true,
          timestamp: new Date(),
          isRoutingMessage: true,
        },
      ]);

      // Get the thread ID from the active conversation
      const threadId = activeConversation?.id;
      if (!threadId) {
        console.error("No thread ID available for direct routing");
        return;
      }

      // Direct routing to specialized assistant
      const specializedResponse = await handleSpecializedAssistantRouting(
        threadId,
        text,
        assistantType
      );

      console.log(`Specialized direct response:`, specializedResponse);

      if (
        specializedResponse &&
        (specializedResponse.success || specializedResponse.answer)
      ) {
        // Replace loading message with actual response
        setMessages((prevMessages) => {
          const messagesWithoutLoading = prevMessages.slice(0, -1);

          return [
            ...messagesWithoutLoading,
            {
              text: specializedResponse.answer,
              isBot: true,
              timestamp: new Date(),
              assistantName: assistantType,
              routedFrom: "Direct",
            },
          ];
        });

        // Also add to conversation history
        if (activeConversation) {
          addAssistantMessageToConversation(
            specializedResponse.answer,
            assistantType,
            "Direct"
          );
        }
      }
    } catch (error) {
      console.error("Error in direct routing:", error);
      // Show error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `Error getting ${assistantType} response: ${error.message}`,
          isBot: true,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;
  const renderMessages = () => {
    return messages
      .map((message, index) => {
        // Check if this is a routing instruction from coordinator
        const isRoutingInstruction =
          message.isBot &&
          (message.text.includes("Forecast Assistant will process") ||
            message.text.includes("Sales Assistant will process") ||
            message.text.includes("routing to Forecast") ||
            message.text.includes("routing to Sales") ||
            message.text.includes("The Forecast Assistant will") ||
            message.text.includes("The Sales Assistant will"));

        // Skip showing intermediate routing messages to avoid confusion
        if (isRoutingInstruction && index < messages.length - 1) {
          // If the next message is from a specialized assistant, don't show this routing message
          return null;
        }

        return (
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
            isRoutingMessage={isRoutingInstruction}
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
        );
      })
      .filter(Boolean); // Remove any null messages
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
      </Box>{" "}
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
          )}{" "}
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
