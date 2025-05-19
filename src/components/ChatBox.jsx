import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme, Button, Fade, Typography } from "@mui/material";
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

  // Debug function for images
  const debugImage = (msg, data) => {
    console.log(`[IMAGE DEBUG] ${msg}`, data);
    setProgressLogs((prev) => [...prev, `[IMAGE] ${msg}: ${JSON.stringify(data)}`]);
  };

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

      // Force save the conversation to ensure it's in localStorage
      if (activeConversation.id && !activeConversation.isNew) {
        updateConversation(activeConversation);
      }
    } else {
      setMessages([]);
      setCurrentThreadId(null);
      setAllowLoggerDisplay(true);
    }
  }, [activeConversation, updateConversation]);

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Always allow logger display regardless of thread context
    setAllowLoggerDisplay(true);

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
        } else if (type === "image") {
          // Enhanced image handling with better logging
          debugImage("Received image update", content);
          if (content && content.fileId) {
            setProgressImages((prev) => {
              // Avoid duplicates by checking fileId
              if (!prev.some((img) => img.fileId === content.fileId)) {
                debugImage("Adding new image to progress images", {
                  fileId: content.fileId,
                  url: content.url || null,
                  count: prev.length + 1,
                });
                return [...prev, content];
              }
              return prev;
            });
          }
        }
      });

      // Handle final answer
      emitter.on("finalAnswer", ({ answer, thread, images }) => {
        // Store thread ID for future messages
        if (thread && thread.id) {
          setCurrentThreadId(thread.id);
        }

        // Check if there are images in the response
        const hasImages = (images && images.length > 0) || progressImages.length > 0;

        // Combine any images from the final answer with progress images
        const allImages = [...progressImages];
        if (images && images.length > 0) {
          debugImage(`Final answer has ${images.length} images`, images);
          // Add any images that aren't already in the progress images array
          images.forEach((img) => {
            if (
              !allImages.some((existingImg) => existingImg.fileId === img.fileId)
            ) {
              allImages.push(img);
            }
          });
        }

        if (allImages.length > 0) {
          debugImage(`Final answer has ${allImages.length} total images`, allImages);
          // Update the progress images with all images
          setProgressImages(allImages);
        }

        // Create the assistant message object (without images)
        const assistantMessage = {
          role: "assistant",
          content: answer,
          timestamp: new Date(),
          assistantName: "Assistant",
          routedFrom: null,
          isChunk: false,
          isFinal: true,
          // No images here - images will be in a separate message
        };

        // Generate a title based on the assistant's first response
        let newTitle = activeConversation.title;
        if (activeConversation.title === "New Conversation") {
          const firstSentence = answer.split(".")[0].trim();
          newTitle =
            firstSentence.substring(0, 40) +
            (firstSentence.length > 40 ? "..." : "");
          newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
          newTitle = newTitle.replace(/[.,;:!?]$/, "");
        }

        // Update conversation with thread ID and final answer
        if (activeConversation) {
          const updatedMessages = [
            ...(activeConversation.messages || []).filter((msg) => !msg.isChunk),
            assistantMessage,
          ];

          // Add an additional message for images if needed
          if (hasImages) {
            const imageMessage = {
              role: "assistant",
              content: "",
              timestamp: new Date(assistantMessage.timestamp.getTime() + 100),
              assistantName: "Assistant",
              isImage: true,
              images: allImages,
              isFinal: true,
            };
            updatedMessages.push(imageMessage);
          }

          const updatedConversation = {
            ...activeConversation,
            threadId: thread?.id || activeConversation.id,
            id: thread?.id || activeConversation.id,
            messages: updatedMessages,
            title: newTitle,
          };
          updateConversation(updatedConversation);
        }

        // Update UI messages
        setMessages((prevMessages) => {
          // Keep chunks but mark them as final
          const updatedMessages = prevMessages.map((msg) => {
            if (msg.isChunk) {
              return { ...msg, isFinal: true };
            }
            return msg;
          });

          // Create the final text message (without images)
          const finalTextMessage = {
            id: `final-${Date.now()}`,
            text: answer,
            isBot: true,
            timestamp: new Date(),
            assistantName: "Assistant",
            isFinal: true,
          };

          let newMessages = [...updatedMessages, finalTextMessage];

          // Add a separate message for images if present
          if (hasImages) {
            const imageMessage = {
              id: `image-${Date.now()}`,
              text: "",
              isBot: true,
              timestamp: new Date(finalTextMessage.timestamp.getTime() + 100),
              images: [...allImages],
              isImage: true,
              isFinal: true,
            };

            debugImage("Creating separate image message", imageMessage);
            newMessages.push(imageMessage);
          }

          return newMessages;
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
          id={message.id || `msg-${index}`}
          message={typeof message === "string" ? message : message.text}
          isBot={message.isBot}
          timestamp={message.timestamp}
          isImage={message.isImage}
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

      // Add dedicated image message bubbles if the message has images
      if (message.images && message.images.length > 0) {
        messageElements.push(
          <ChatMessage
            key={`${message.id || `msg-${index}`}-images`}
            id={`${message.id || `msg-${index}`}-images`}
            message=""
            isBot={true}
            timestamp={new Date(message.timestamp.getTime() + 100)} // slightly after
            images={message.images}
            isImage={true}
            isChunk={false}
            isFinal={true}
          />
        );
      }

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
        position: "relative",
      }}
    >
      {/* Main scrollable container - only one with overflow */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "70px" /* Reserve space for input box */,
          overflowY: "auto" /* Single scrollbar here */,
          overflowX: "hidden",
        }}
      >
        {/* Fixed Logger that's always visible */}
        {allowLoggerDisplay && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              pb: 1,
              mb: 2,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Logger logs={progressLogs} isLoading={isLoading} showCountOnly={true} />
          </Box>
        )}
        <Box
          sx={{
            px: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "visible" /* Ensure no scrollbar here */,
          }}
        >
          {isChatEmpty && !isLoading ? (
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
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70px",
          zIndex: 10,
        }}
      >
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          onStopGenerating={handleStopGenerating}
        />
      </Box>
    </Box>
  );
};

export default ChatBox;
