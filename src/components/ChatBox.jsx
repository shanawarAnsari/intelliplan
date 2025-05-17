import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme, Button, Fade, Typography } from "@mui/material";
import DomainCards from "./DomainCards";
import Logger from "./Logger";
import ThinkingIndicator from "./ThinkingIndicator";
import Logo from "../assets/Intelliplan-logo.png";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import HelpFAQ from "./HelpFAQ";
import TopNavbar from "./TopNavbar";
import { orchestrateStreaming } from "../services/StreamingService";
import { useConversation } from "../contexts/ConversationContext";

const ChatBox = ({ drawerOpen, onToggleDrawer, onIsLoadingChange }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [progressImages, setProgressImages] = useState([]);
  const [streamStopped, setStreamStopped] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [allowLoggerDisplay, setAllowLoggerDisplay] = useState(true);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

  // Refs and context
  const messagesEndRef = useRef(null);
  const emitterRef = useRef(null);
  const theme = useTheme();
  const { activeConversation, updateConversation } = useConversation();

  // Toggle help drawer
  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  // Notify parent about loading state changes
  useEffect(() => {
    if (onIsLoadingChange) {
      onIsLoadingChange(isLoading);
    }
  }, [isLoading, onIsLoadingChange]);

  // Sync messages with active conversation
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

      // Reset thread ID based on conversation status
      const isNewConversation =
        !activeConversation.threadId || activeConversation.isNew;
      if (isNewConversation) {
        setCurrentThreadId(null);
        setAllowLoggerDisplay(true);
      } else {
        setCurrentThreadId(
          activeConversation.threadId || activeConversation.id || null
        );
      }
    } else {
      setMessages([]);
      setCurrentThreadId(null);
      setAllowLoggerDisplay(true);
    }
  }, [activeConversation]);

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Show logger only for new threads
    const isNewThreadContext = !currentThreadId;
    setAllowLoggerDisplay(isNewThreadContext);

    // Create the user message
    const userMessage = { text, isBot: false, timestamp: new Date() };

    // Reset state for new message
    setIsLoading(true);
    setProgressLogs([]);
    setProgressImages([]);
    setStreamStopped(false);

    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Use streaming approach with thread ID
      const threadIdToUse =
        currentThreadId || activeConversation?.threadId || activeConversation?.id;
      const emitter = orchestrateStreaming(text, threadIdToUse);
      emitterRef.current = emitter;

      // Handle streaming updates
      emitter.on("update", (update) => {
        const { type, content, handler } = update;

        setProgressLogs((prevLogs) => [
          ...prevLogs,
          `${handler || "System"} (${type}): ${
            typeof content === "string" ? content : JSON.stringify(content)
          }`,
        ]);

        // Handle text chunks and other message types
        if (type === "text_chunk") {
          // Update message with streamed content
          setMessages((prevMessages) => {
            // Find the last bot message that's a chunk or create a new one
            const lastChunkIndex = [...prevMessages]
              .reverse()
              .findIndex((m) => m.isBot && m.isChunk);
            const hasChunk = lastChunkIndex !== -1;
            const chunkIndex = hasChunk
              ? prevMessages.length - 1 - lastChunkIndex
              : -1;

            if (hasChunk) {
              // Update existing chunk
              const updatedMessages = [...prevMessages];
              updatedMessages[chunkIndex] = {
                ...updatedMessages[chunkIndex],
                text: updatedMessages[chunkIndex].text + content,
              };
              return updatedMessages;
            } else {
              // Create a new chunk message
              return [
                ...prevMessages,
                {
                  id: `chunk-${Date.now()}`,
                  text: content,
                  isBot: true,
                  timestamp: new Date(),
                  isChunk: true,
                  isFinal: false,
                },
              ];
            }
          });
        } else if (type === "image" && content && content.url) {
          // Handle image updates
          setProgressImages((prev) => [...prev, content]);
        }
      });

      // Handle final answer
      emitter.on("finalAnswer", ({ answer, thread }) => {
        // Store thread ID for future messages
        if (thread && thread.id) {
          setCurrentThreadId(thread.id);

          // Update conversation with thread ID
          if (activeConversation) {
            const updatedConversation = {
              ...activeConversation,
              threadId: thread.id,
              id: thread.id,
            };
            updateConversation(updatedConversation);
          }
        }

        // Create final message
        setMessages((prevMessages) => {
          // Remove any existing chunks
          const messagesWithoutChunks = prevMessages.filter((msg) => !msg.isChunk);

          // Create the final message
          const finalMessage = {
            id: `final-${Date.now()}`,
            text: answer,
            isBot: true,
            timestamp: new Date(),
            assistantName: "Assistant",
            isFinal: true,
            images: progressImages.length > 0 ? progressImages : undefined,
          };

          return [...messagesWithoutChunks, finalMessage];
        });

        setIsLoading(false);
      });

      // Handle errors
      emitter.on("error", ({ message }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            text: `Sorry, there was an error: ${message}`,
            isBot: true,
            timestamp: new Date(),
            isError: true,
          },
        ]);

        setIsLoading(false);
      });

      // Handle stream stopped
      emitter.on("stopped", () => {
        setStreamStopped(true);
        setIsLoading(false);
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

  // Stop generating response
  const handleStopGenerating = () => {
    if (emitterRef.current && emitterRef.current.stop) {
      emitterRef.current.stop();
    }
    setIsLoading(false);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => !m.isBot);
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isChatEmpty = messages.length === 0;

  // Render all messages with appropriate components
  const renderMessages = () => {
    const messageElements = [];
    let lastUserMessageIndex = -1;

    // Find the last user message index
    messages.forEach((msg, idx) => {
      if (!msg.isBot) {
        lastUserMessageIndex = idx;
      }
    });

    // Process each message
    messages.forEach((message, index) => {
      const isLastMessageInStream = index === messages.length - 1;

      // Add the ChatMessage component
      messageElements.push(
        <ChatMessage
          key={message.id || `msg-${index}`}
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
              ? handleRegenerate
              : undefined
          }
          logs={message.logs}
          isLoadingLogs={isLoading && isLastMessageInStream}
        />
      );

      // Show thinking indicator after user message during loading
      if (!message.isBot && index === lastUserMessageIndex && isLoading) {
        messageElements.push(
          <ThinkingIndicator key="thinking" text="Thinking" showSpinner={true} />
        );
      }

      // Show end of response indicator after final bot message
      if (message.isBot && message.isFinal && isLastMessageInStream && !isLoading) {
        messageElements.push(
          <ThinkingIndicator
            key="end-response"
            text="End of response"
            showSpinner={false}
            lineVariant="full"
            isDone={true}
          />
        );
      }

      // Show logger after last user message if allowed
      if (
        !message.isBot &&
        (isLoading || progressLogs.length > 0) &&
        index === lastUserMessageIndex &&
        allowLoggerDisplay
      ) {
        messageElements.push(
          <Logger key="logger" logs={progressLogs} isLoading={isLoading} />
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
      {" "}
      {/* Header */}
      <TopNavbar
        drawerOpen={drawerOpen}
        onToggleDrawer={onToggleDrawer}
        onToggleHelp={toggleHelpDrawer}
      />
      {/* Help FAQ Drawer */}
      <HelpFAQ open={helpDrawerOpen} onClose={() => setHelpDrawerOpen(false)} />
      {/* Chat Content */}
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
              <Box sx={{ width: "100%", maxWidth: "700px", mx: "auto", mt: 2 }}>
                <DomainCards />
              </Box>
              <Fade in={true} timeout={800}>
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
          )}
          {streamStopped && messages.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="outlined" onClick={handleRegenerate}>
                Regenerate response?
              </Button>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
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
