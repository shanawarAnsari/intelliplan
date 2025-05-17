import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme, Button, Fade, Typography } from "@mui/material";
import DomainCards from "./DomainCards";
import Logger from "./Logger";
import ThinkingIndicator from "./ThinkingIndicator";
import Logo from "../assets/Intelliplan-logo.png";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import { orchestrateStreaming } from "../services/StreamingService";
import { useConversation } from "../contexts/ConversationContext";

const ChatBox = ({ onIsLoadingChange }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [progressImages, setProgressImages] = useState([]);
  const [streamStopped, setStreamStopped] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [allowLoggerDisplay, setAllowLoggerDisplay] = useState(true);

  // Refs and context
  const messagesEndRef = useRef(null);
  const emitterRef = useRef(null);
  const theme = useTheme();
  const { activeConversation, updateConversation } = useConversation();

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
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date(),
      role: "user",
      content: text,
    };

    // Reset state for new message
    setIsLoading(true);
    setProgressLogs([]);
    setProgressImages([]);
    setStreamStopped(false);

    // Add user message to chat and update conversation
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Update the conversation with the user message
    if (activeConversation) {
      const updatedConversation = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), userMessage],
      };
      updateConversation(updatedConversation);
    }

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
          // Check if the content contains a complete paragraph or meaningful unit
          // Using moderate thresholds for message bubble size
          const isSignificantContent =
            content.length > 200 ||
            (content.includes("\n\n") && content.length > 100) ||
            (content.includes(".") && content.includes("\n") && content.length > 80);

          // Update message with streamed content
          setMessages((prevMessages) => {
            // Find the last bot message that's a chunk
            const lastChunkIndex = [...prevMessages]
              .reverse()
              .findIndex((m) => m.isBot && m.isChunk);
            const hasChunk = lastChunkIndex !== -1;
            const chunkIndex = hasChunk
              ? prevMessages.length - 1 - lastChunkIndex
              : -1;

            let updatedMessages = [...prevMessages];
            let newMessage;

            // Check if existing chunk is getting too large
            const existingChunkIsLarge =
              hasChunk &&
              (updatedMessages[chunkIndex].text.length > 300 ||
                updatedMessages[chunkIndex].text.split(". ").length > 2);

            if (hasChunk && !isSignificantContent && !existingChunkIsLarge) {
              // Update existing chunk if content isn't significant enough for a new bubble
              updatedMessages[chunkIndex] = {
                ...updatedMessages[chunkIndex],
                text: updatedMessages[chunkIndex].text + content,
                content: updatedMessages[chunkIndex].text + content,
                role: "assistant",
              };
              newMessage = updatedMessages[chunkIndex];
            } else {
              // Create a new chunk message for significant content or new paragraphs
              newMessage = {
                id: `chunk-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 9)}`,
                text: content,
                content: content,
                isBot: true,
                role: "assistant",
                timestamp: new Date(),
                isChunk: true,
                isFinal: false,
              };
              updatedMessages = [...updatedMessages, newMessage];
            }

            // Update conversation to save thinking messages in history
            if (activeConversation) {
              const updatedConversation = {
                ...activeConversation,
                messages: [...(activeConversation.messages || [])],
              };

              // Either update the last message or add a new one
              if (hasChunk && !isSignificantContent && !existingChunkIsLarge) {
                const lastIndex = updatedConversation.messages.length - 1;
                if (
                  lastIndex >= 0 &&
                  updatedConversation.messages[lastIndex].isChunk
                ) {
                  updatedConversation.messages[lastIndex] = newMessage;
                }
              } else {
                updatedConversation.messages.push(newMessage);
              }

              updateConversation(updatedConversation);
            }

            return updatedMessages;
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
        } // Create final message
        setMessages((prevMessages) => {
          // Keep chunks but mark them as final
          const updatedMessages = prevMessages.map((msg) => {
            if (msg.isChunk) {
              return {
                ...msg,
                isFinal: true,
              };
            }
            return msg;
          });

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

          return [...updatedMessages, finalMessage];
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
      const isLastMessageInStream = index === messages.length - 1; // Add the ChatMessage component
      messageElements.push(
        <ChatMessage
          key={message.id || `msg-${index}`}
          id={message.id || `msg-${index}`} // Pass the message id
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
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 2,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
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
                    flexGrow: 1,
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

        <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            onStopGenerating={handleStopGenerating}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
