import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
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
import ThinkingIndicator from "./ThinkingIndicator"; // Import the new ThinkingIndicator

const ChatBox = ({ drawerOpen, onToggleDrawer, onIsLoadingChange }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]); // State for logger
  const [progressImages, setProgressImages] = useState([]); // Track images during streaming
  const [streamStopped, setStreamStopped] = useState(false); // State for stream stopped
  const [currentThreadId, setCurrentThreadId] = useState(null); // Store current thread ID for conversation continuity
  const [allowLoggerDisplay, setAllowLoggerDisplay] = useState(true); // Control logger visibility - start with true for first message
  const messagesEndRef = useRef(null);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const theme = useTheme();
  const { activeConversation, updateConversation, conversations, setConversations } =
    useConversation();
  const emitterRef = useRef(null);

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  // Notify parent component about loading state changes
  useEffect(() => {
    if (onIsLoadingChange) {
      onIsLoadingChange(isLoading);
    }
  }, [isLoading, onIsLoadingChange]);
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

      // Reset currentThreadId based on the active conversation
      // If it's a truly new conversation (e.g., no messages, no explicit threadId yet)
      // or if the threadId from the conversation context should be used.
      const isNewConversation =
        !activeConversation.threadId || activeConversation.isNew;

      if (isNewConversation) {
        // For new conversations, reset thread ID and allow logger display
        setCurrentThreadId(null);
        setAllowLoggerDisplay(true); // Enable logger for new conversations
      } else {
        // For existing conversations, use the thread ID
        setCurrentThreadId(
          activeConversation.threadId || activeConversation.id || null
        );
        // Don't change allowLoggerDisplay here, it will be determined by handleSendMessage
      }
    } else {
      // No active conversation
      setMessages([]);
      setCurrentThreadId(null);
      setAllowLoggerDisplay(true); // Reset logger display permission for brand new conversations
    }
  }, [activeConversation]);
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Determine if the logger should be displayed for this interaction.
    // Show logger if currentThreadId is null (implies new conversation/thread context).
    const isNewThreadContext = !currentThreadId;
    setAllowLoggerDisplay(isNewThreadContext);

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
        const { type, content, handler, timestamp } = update; // Add to progress logs
        setProgressLogs((prevLogs) => [
          ...prevLogs,
          `${handler || "System"} (${type}): ${
            typeof content === "string" ? content : JSON.stringify(content)
          }`,
        ]); // Add each text chunk as a separate message with a special style
        if (type === "text_chunk") {
          // Only add the chunk if it contains meaningful text (not just whitespace or punctuation)
          if (content && content.trim().length > 10) {
            // Require more substantial content
            // Merge with previous chunk if it exists and is recent
            setMessages((prevMessages) => {
              // Find the last message
              const lastMsg =
                prevMessages.length > 0
                  ? prevMessages[prevMessages.length - 1]
                  : null;

              // Check if the last message was a chunk and it's recent (within 2 seconds)
              const isLastMsgChunk = lastMsg && lastMsg.isBot && lastMsg.isChunk;
              const isRecent =
                lastMsg && new Date() - new Date(lastMsg.timestamp) < 2000; // Within 2 seconds

              if (isLastMsgChunk && isRecent) {
                // Update the existing chunk with merged content - preserve formatting
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                  ...lastMsg,
                  text: `${lastMsg.text}${
                    lastMsg.text.endsWith(" ") || content.startsWith(" ") ? "" : " "
                  }${content}`,
                  timestamp: new Date(),
                };
                return updatedMessages;
              } else {
                // Create a new chunk
                return [
                  ...prevMessages,
                  {
                    id: `chunk-${Date.now()}-${Math.random()
                      .toString(36)
                      .substring(2, 9)}`,
                    text: content,
                    isBot: true,
                    timestamp: timestamp || new Date(),
                    isChunk: true, // Flag to identify as a stream chunk
                  },
                ];
              }
            });

            // Scroll to the latest message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        } else if (type === "image_file") {
          console.log("Image received during streaming:", content.file_id);
          // Add image only if it's not already added (prevent duplicates)
          setProgressImages((prevImages) => {
            const imageExists = prevImages.some(
              (img) => img.fileId === content.file_id
            );
            if (imageExists) return prevImages;

            return [
              ...prevImages,
              {
                id: `image-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 9)}`,
                fileId: content.file_id,
                url: content.url,
                timestamp: new Date(),
              },
            ];
          });
        }
      });

      // Handle final answer
      emitter.on("finalAnswer", ({ answer, thread }) => {
        // Store the thread ID for future messages in this conversation
        if (thread && thread.id) {
          console.log("Storing thread ID for future messages:", thread.id);
          setCurrentThreadId(thread.id);
        } else {
          console.warn("No thread ID received in finalAnswer");
        }

        // Create a final message with proper styling
        const finalMessage = {
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
        };

        // Add the final answer as a separate message with special styling
        setMessages((prevMessages) => [...prevMessages, finalMessage]);

        // Force scroll to the bottom to ensure final message is visible
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        // Update conversation context
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
    const messageElements = [];
    let lastUserMessageIndex = -1;

    // First pass: find the last user message index
    messages.forEach((msg, idx) => {
      if (!msg.isBot) lastUserMessageIndex = idx;
    });

    messages.forEach((message, index) => {
      const isLastMessageInStream = index === messages.length - 1;

      // Add a divider before rendering the final bot message if it's marked as final
      if (message.isBot && message.isFinal && !message.isChunk) {
        messageElements.push(
          <ThinkingIndicator
            key={`divider-${message.id || index}`}
            text="" // No text for divider
            isSticky={false}
            showSpinner={false}
            lineVariant="full" // Full line divider
            isDivider={true} // Mark as divider
          />
        );
      }

      // Add the ChatMessage component itself
      messageElements.push(
        <ChatMessage
          key={message.id || `msg-${index}`} // Use message.id if available, otherwise fallback
          message={typeof message === "string" ? message : message.text}
          isBot={message.isBot}
          timestamp={message.timestamp}
          isImage={message.isFinal && message.isImage}
          imageUrl={message.imageUrl}
          imageFileId={message.imageFileId}
          images={message.images}
          isChunk={message.isChunk}
          isFinal={message.isFinal}
          onRegenerateResponse={
            message.isBot && isLastMessageInStream && message.isFinal
              ? () => {
                  const lastUserMsg = [...messages].reverse().find((m) => !m.isBot);
                  if (lastUserMsg) {
                    handleSendMessage(lastUserMsg.text);
                  }
                }
              : undefined
          }
          logs={message.logs}
          isLoadingLogs={isLoading && isLastMessageInStream}
        />
      ); // Render sticky "Thinking..." indicator immediately after the last user message if still loading
      if (!message.isBot && index === lastUserMessageIndex && isLoading) {
        messageElements.push(
          <ThinkingIndicator
            key={`thinking-sticky-${message.id || index}`}
            text="Processing your request"
            isSticky={true}
            showSpinner={true}
            lineVariant="partial"
          />
        );
      }

      // Render "End of response" indicator after the final bot message group
      if (message.isBot && message.isFinal && isLastMessageInStream && !isLoading) {
        messageElements.push(
          <ThinkingIndicator
            key={`final-indicator-${message.id || index}`}
            text="End of response"
            isSticky={false} // Not sticky
            showSpinner={false} // No spinner for final answer
            lineVariant="full" // Full line for final answer
            isDone={true} // Mark as done
          />
        );
      }

      // Render Logger component after the last user message if allowed and relevant
      if (
        !message.isBot &&
        (isLoading || progressLogs.length > 0) &&
        index === lastUserMessageIndex && // Show logger only after the *absolute* last user message
        allowLoggerDisplay // Ensure logger visibility is controlled
      ) {
        messageElements.push(
          <Box
            key={`logger-box-${message.id || index}`}
            sx={{ width: "100%", maxWidth: "825px", ml: "auto", mt: 0.5, mb: 1 }}
          >
            <Logger logs={progressLogs} isLoading={isLoading} />
          </Box>
        );
      }
    });
    return messageElements;
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
          {streamStopped && messages.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="outlined" onClick={handleRegenerate}>
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
