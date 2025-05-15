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
import MenuIcon from "@mui/icons-material/Menu";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/Intelliplan-logo.png";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpFAQ from "./HelpFAQ";
import { orchestrateStreaming } from "../services/StreamingService";
import DomainCards from "./DomainCards"; // Import the new component
import Logger from "./Logger"; // Import the Logger component

const ChatBox = ({ drawerOpen, onToggleDrawer }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]); // State for logger
  const [progressImages, setProgressImages] = useState([]); // Track images during streaming
  const [streamStopped, setStreamStopped] = useState(false); // State for stream stopped
  const [currentThreadId, setCurrentThreadId] = useState(null); // Store current thread ID for conversation continuity
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const { activeConversation, updateConversation, conversations, setConversations } =
    useConversation();
  const emitterRef = useRef(null);

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };
  useEffect(() => {
    if (activeConversation && activeConversation.messages) {
      const formattedMessages = activeConversation.messages.map((msg) => ({
        id:
          msg.id ||
          `restored-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: msg.content,
        isBot: msg.role === "assistant",
        timestamp: new Date(msg.timestamp) || new Date(),
        assistantName: msg.assistantName,
        routedFrom: msg.routedFrom,
        isImage: msg.isImage || false,
        imageUrl: msg.imageUrl,
        imageFileId: msg.imageFileId,
        isChunk: msg.isChunk || false,
        isFinal: msg.isFinal || false,
        threadId: msg.threadId,
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { text, isBot: false, timestamp: new Date() };

    // Clear previous logs and start loading state
    setIsLoading(true);
    setProgressLogs([]);
    setProgressImages([]);
    setStreamStopped(false); // Reset on new message

    // Log the current thread ID being used
    console.log("Using thread ID for this message:", currentThreadId);

    // Add the user message to the chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    try {
      // Use streaming approach with the current thread ID
      const threadIdToUse =
        currentThreadId || activeConversation?.threadId || activeConversation?.id;
      console.log("Using thread ID for this message:", threadIdToUse);
      const emitter = orchestrateStreaming(text, threadIdToUse);
      emitterRef.current = emitter;

      // Handle streaming updates
      emitter.on("update", (update) => {
        const { type, content, handler, timestamp } = update;

        // Add to progress logs
        setProgressLogs((prevLogs) => [
          ...prevLogs,
          `${handler || "System"} (${type}): ${
            typeof content === "string" ? content : JSON.stringify(content)
          }`,
        ]);

        // Add each text chunk as a separate message with a special style
        if (type === "text_chunk") {
          // Only add the chunk if it contains meaningful text (not just whitespace or punctuation)
          if (content && content.trim().length > 3) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: `chunk-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 9)}`,
                text: content,
                isBot: true,
                timestamp: timestamp || new Date(),
                isChunk: true, // Flag to identify as a stream chunk
                // Remove handler to simplify the interface - we'll only show "Thinking..."
              },
            ]);

            // Scroll to the latest message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        } // Handle images during streaming
        else if (type === "image_file") {
          console.log("Image received during streaming:", content.file_id);
          // Make sure we have both fileId and url
          setProgressImages((prevImages) => [
            ...prevImages,
            {
              id: `image-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`,
              fileId: content.file_id,
              url: content.url,
              // Add a timestamp for potential sorting/ordering
              timestamp: new Date(),
            },
          ]);
        }
      }); // Handle final answer
      emitter.on("finalAnswer", ({ answer, thread }) => {
        // Store the thread ID for future messages in this conversation
        if (thread && thread.id) {
          console.log("Storing thread ID for future messages:", thread.id);
          setCurrentThreadId(thread.id);
        } else {
          console.warn("No thread ID received in finalAnswer");
        }

        // Add the final answer as a separate message with special styling
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `final-${Date.now()}`,
            text: answer,
            isBot: true,
            timestamp: new Date(),
            isFinal: true, // Flag to identify as the final answer
            threadId: thread?.id,
            handler: "Final",
            // Check if answer contains image references
            isImage: (answer && answer.includes("![")) || progressImages.length > 0,
            // Include all collected image URLs
            images: progressImages.length > 0 ? progressImages : undefined,
          },
        ]); // Update conversation context
        if (activeConversation) {
          // Get all messages, including chunks and the final answer
          const conversationMessages = [...messages];

          const updatedConversation = {
            ...activeConversation,
            id: thread?.id || activeConversation.id, // Use the thread ID as the conversation ID
            threadId: thread?.id, // Store thread ID explicitly
            messages: conversationMessages.map((msg) => ({
              content: msg.text,
              role: msg.isBot ? "assistant" : "user",
              timestamp: msg.timestamp,
              assistantName: msg.assistantName,
              routedFrom: msg.routedFrom || msg.handler,
              isImage: msg.isImage || false,
              imageUrl: msg.imageUrl,
              imageFileId: msg.imageFileId,
              threadId: msg.threadId,
              isChunk: msg.isChunk || false,
              isFinal: msg.isFinal || false,
            })),
            title:
              activeConversation.title === "New Conversation"
                ? text.substring(0, 30) + (text.length > 30 ? "..." : "")
                : activeConversation.title,
          };

          // Update conversation in context and localStorage
          if (updateConversation) {
            updateConversation(updatedConversation);

            // Ensure the conversation is added to the list of conversations
            const existingConvIndex = conversations.findIndex(
              (conv) => conv.id === updatedConversation.id
            );

            if (existingConvIndex === -1) {
              // If this is a new conversation, add it to the list
              const updatedConversations = [...conversations, updatedConversation];
              setConversations(updatedConversations);
              localStorage.setItem(
                "conversations",
                JSON.stringify(updatedConversations)
              );
            }
          }
        }

        setIsLoading(false);
      });

      // Handle errors
      emitter.on("error", ({ message, error }) => {
        console.error("Streaming error:", error);
        setProgressLogs((prevLogs) => [...prevLogs, `Error: ${message}`]);

        // Add error message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            text: `Error: ${message}`,
            isBot: true,
            timestamp: new Date(),
            isError: true,
          },
        ]);

        setIsLoading(false);
      });

      emitter.on("stopped", () => {
        setIsLoading(false);
        setStreamStopped(true);
      });
    } catch (error) {
      console.error("Error communicating with the assistant:", error);

      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, there was an error processing your request. Please try again.",
          isBot: true,
          timestamp: new Date(),
          isError: true,
        },
      ]);

      setIsLoading(false);
    }
  };

  const handleStopGenerating = () => {
    if (emitterRef.current && emitterRef.current.stop) {
      emitterRef.current.stop();
    }
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => !m.isBot);
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;

  const renderMessages = () => {
    return messages.map((message, index) => {
      return (
        <React.Fragment key={`msg-frag-${index}`}>
          <ChatMessage
            key={`msg-${index}`}
            message={typeof message === "string" ? message : message.text}
            isBot={message.isBot}
            timestamp={message.timestamp}
            isImage={message.isFinal && message.isImage} // Only show images in final answers
            imageUrl={message.imageUrl}
            imageFileId={message.imageFileId}
            images={message.images} // Pass collected images to ChatMessage
            // Removed assistantName and routedFrom to simplify UI
            isChunk={message.isChunk}
            isFinal={message.isFinal}
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
            logs={message.logs}
            isLoadingLogs={isLoading && index === messages.length - 1}
          />
          {/* Render Logger component after user message if loading or if logs exist */}
          {!message.isBot &&
            (isLoading || progressLogs.length > 0) &&
            index === messages.length - 1 && (
              <Box
                sx={{ width: "100%", maxWidth: "825px", ml: "auto", mt: 0.5, mb: 1 }}
              >
                <Logger logs={progressLogs} isLoading={isLoading} />
              </Box>
            )}
        </React.Fragment>
      );
    });
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
          >
            {" "}
            Doe, John
          </Typography>
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
              <Box sx={{ width: "100%", maxWidth: "700px", mx: "auto", mt: 2 }}>
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
                  </Typography>{" "}
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
                          onStopGenerating={handleStopGenerating}
                        />
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Fade>
            </>
          ) : (
            renderMessages()
          )}{" "}
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
              />{" "}
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}
              >
                {messages?.length > 0 && "working on it..."}
              </Typography>
            </Box>
          )}
          {streamStopped && messages.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                // style={{
                //   background: "#eee",
                //   color: "#888",
                //   border: "1px solid #ccc",
                //   borderRadius: 6,
                //   padding: "8px 18px",
                //   fontSize: "1rem",
                //   cursor: "pointer",
                //   opacity: 0.7,
                //   pointerEvents: "auto",
                // }}
                onClick={handleRegenerate}
              >
                Regenerate response?
              </Button>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>{" "}
        {(!isChatEmpty || messages.length > 0) && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              onStopGenerating={handleStopGenerating}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatBox;
