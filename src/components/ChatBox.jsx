import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme, Button, Fade, Typography } from "@mui/material";
import Logger from "./Logger";
import ThinkingIndicator from "./ThinkingIndicator";
import Logo from "../assets/Intelliplan-logo.png";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import { orchestrateStreaming } from "../services/StreamingService";
import { useConversation } from "../contexts/ConversationContext";
import { useConversationHistory } from "../hooks/useConversationHistory";

const ChatBox = ({ onIsLoadingChange }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [progressImages, setProgressImages] = useState([]);
  const [streamStopped, setStreamStopped] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [allowLoggerDisplay, setAllowLoggerDisplay] = useState(true);

  const debugImage = (msg, data) => {
    setProgressLogs((prev) => [...prev, `[IMAGE] ${msg}: ${JSON.stringify(data)}`]);
  };

  const messagesEndRef = useRef(null);
  const emitterRef = useRef(null);
  const theme = useTheme();
  const { activeConversation, updateConversation } = useConversation();
  const { processConversationUpdate } = useConversationHistory();
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
        images: msg.images || [],
        hasImages: msg.hasImages || (msg.images && msg.images.length > 0),
        imageFileIds: msg.imageFileIds || [],
        isChunk: msg.isChunk || false,
        isFinal: msg.isFinal || false,
        threadId: msg.threadId,
        role: msg.role || (msg.isBot ? "assistant" : "user"),
        content: msg.content || msg.text,
      }));
      setMessages(formattedMessages);

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
  useEffect(() => {
    if (activeConversation && activeConversation.id && !activeConversation.isNew) {
      // Only update conversations that have messages
      if (activeConversation.messages && activeConversation.messages.length > 0) {
        const timeoutId = setTimeout(() => {
          updateConversation(activeConversation);
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [activeConversation, updateConversation]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setAllowLoggerDisplay(true);
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date(),
      role: "user",
      content: text,
    };

    setIsLoading(true);
    setProgressLogs([]);
    setProgressImages([]);
    setStreamStopped(false);

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    if (activeConversation) {
      const updatedConversation = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), userMessage],
      };
      updateConversation(updatedConversation);

      // Save to localStorage in real-time
      const conversations = JSON.parse(
        localStorage.getItem("conversations") || "[]"
      );
      const updatedConversations = processConversationUpdate(
        updatedConversation,
        conversations
      );
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    }

    try {
      const threadIdToUse =
        currentThreadId || activeConversation?.threadId || activeConversation?.id;
      const emitter = orchestrateStreaming(text, threadIdToUse);
      emitterRef.current = emitter;

      emitter.on("update", (update) => {
        const { type, content, handler } = update;

        setProgressLogs((prevLogs) => [
          ...prevLogs,
          `${handler || "System"} (${type}): ${
            typeof content === "string" ? content : JSON.stringify(content)
          }`,
        ]);

        if (type === "text_chunk") {
          const isSignificantContent =
            content.length > 200 ||
            (content.includes("\n\n") && content.length > 100) ||
            (content.includes(".") && content.includes("\n") && content.length > 80);

          setMessages((prevMessages) => {
            const lastChunkIndex = [...prevMessages]
              .reverse()
              .findIndex((m) => m.isBot && m.isChunk);
            const hasChunk = lastChunkIndex !== -1;
            const chunkIndex = hasChunk
              ? prevMessages.length - 1 - lastChunkIndex
              : -1;

            let updatedMessages = [...prevMessages];
            let newMessage;

            const existingChunkIsLarge =
              hasChunk &&
              (updatedMessages[chunkIndex].text.length > 300 ||
                updatedMessages[chunkIndex].text.split(". ").length > 2);

            if (hasChunk && !isSignificantContent && !existingChunkIsLarge) {
              updatedMessages[chunkIndex] = {
                ...updatedMessages[chunkIndex],
                text: updatedMessages[chunkIndex].text + content,
                content: updatedMessages[chunkIndex].text + content,
                role: "assistant",
              };
              newMessage = updatedMessages[chunkIndex];
            } else {
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
                threadId: threadIdToUse,
              };
              updatedMessages = [...updatedMessages, newMessage];
            }
            if (activeConversation) {
              const updatedConversation = {
                ...activeConversation,
                messages: [...(activeConversation.messages || [])],
              };
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

              // Save chunk messages to localStorage in real-time
              const conversations = JSON.parse(
                localStorage.getItem("conversations") || "[]"
              );
              const updatedConversations = processConversationUpdate(
                updatedConversation,
                conversations
              );
              localStorage.setItem(
                "conversations",
                JSON.stringify(updatedConversations)
              );
            }

            return updatedMessages;
          });
        } else if (type === "image") {
          debugImage("Received image update", content);
          if (content && content.fileId) {
            // Store the image temporarily in progressImages for this specific conversation and thread
            setProgressImages((prev) => {
              // Only add the image if it's not already in progressImages
              if (!prev.some((img) => img.fileId === content.fileId)) {
                const currentThreadIdentifier =
                  currentThreadId ||
                  activeConversation?.threadId ||
                  activeConversation?.id;
                debugImage("Adding new image to progress images", {
                  fileId: content.fileId,
                  url: content.url || null,
                  threadId: currentThreadIdentifier,
                  count: prev.length + 1,
                });
                return [
                  ...prev,
                  {
                    ...content,
                    // Add message ID and thread ID to track image context
                    threadId: currentThreadIdentifier,
                    messageId: `msg-${Date.now()}`,
                    timestamp: new Date(),
                  },
                ];
              }
              return prev;
            });
          }
        }
      });
      emitter.on("finalAnswer", ({ answer, thread, images }) => {
        if (thread && thread.id) {
          setCurrentThreadId(thread.id);
        }

        const threadIdentifier =
          thread?.id ||
          currentThreadId ||
          activeConversation?.threadId ||
          activeConversation?.id;

        // Combine images from the response with any progress images
        const allAvailableImages = [
          ...(images || []),
          ...(progressImages || []).filter(
            (img) => img.threadId === threadIdentifier
          ),
        ];

        // Make sure we have no duplicate images
        const uniqueImages = [];
        allAvailableImages.forEach((img) => {
          if (
            !uniqueImages.some((existingImg) => existingImg.fileId === img.fileId)
          ) {
            uniqueImages.push({
              ...img,
              threadId: threadIdentifier,
              messageId: `msg-final-${Date.now()}`,
            });
          }
        });

        const hasImages = uniqueImages.length > 0;

        if (hasImages) {
          debugImage(
            `Final answer has ${uniqueImages.length} unique images for this response`,
            uniqueImages
          );
          // Reset progressImages for next message
          setProgressImages([]);
        }

        // Create a single assistant message with both text and images
        const assistantMessage = {
          role: "assistant",
          content: answer,
          timestamp: new Date(),
          assistantName: "Assistant",
          routedFrom: null,
          isChunk: false,
          isFinal: true,
          threadId: threadIdentifier,
          id: `msg-final-${Date.now()}`,
          // Attach images directly to the message if they exist
          ...(hasImages && {
            hasImages: true,
            images: uniqueImages,
            imageFileIds: uniqueImages.map((img) => img.fileId),
          }),
        };

        let newTitle = activeConversation.title;
        if (activeConversation.title === "New Conversation") {
          const firstSentence = answer.split(".")[0].trim();
          newTitle =
            firstSentence.substring(0, 40) +
            (firstSentence.length > 40 ? "..." : "");
          newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
          newTitle = newTitle.replace(/[.,;:!?]$/, "");
        }
        if (activeConversation) {
          // Keep ALL existing messages and simply append the final message without any filtering
          // Do not remove or filter any messages, just keep adding to the array
          const existingMessages = activeConversation.messages || [];

          // Simply add the new message to the array without filtering anything
          const updatedMessages = [...existingMessages, assistantMessage];

          const updatedConversation = {
            ...activeConversation,
            threadId: threadIdentifier,
            id: threadIdentifier,
            messages: updatedMessages,
            title: newTitle,
          };
          updateConversation(updatedConversation); // Save final conversation to localStorage
          const conversations = JSON.parse(
            localStorage.getItem("conversations") || "[]"
          );
          const updatedConversations = processConversationUpdate(
            updatedConversation,
            conversations
          );
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
        } // Update UI messages
        setMessages((prevMessages) => {
          // Preserve all existing messages without modifying their properties
          // Just add the final message to display
          const finalMessage = {
            id: assistantMessage.id,
            text: answer,
            isBot: true,
            threadId: threadIdentifier,
            timestamp: new Date(),
            assistantName: "Assistant",
            isFinal: true,
            role: "assistant",
            content: answer,
            // Attach images directly if they exist
            ...(hasImages && {
              hasImages: true,
              images: [...uniqueImages],
              imageFileIds: uniqueImages.map((img) => img.fileId),
            }),
          };

          return [...prevMessages, finalMessage];
        });

        setIsLoading(false);
      });
      emitter.on("error", ({ message }) => {
        const errorMessage = {
          id: `error-${Date.now()}`,
          text: `Sorry, there was an error: ${message}`,
          content: `Sorry, there was an error: ${message}`,
          isBot: true,
          role: "assistant",
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);

        // Save error message to conversation history
        if (activeConversation) {
          const updatedConversation = {
            ...activeConversation,
            messages: [...(activeConversation.messages || []), errorMessage],
          };

          updateConversation(updatedConversation);

          // Save to localStorage
          const conversations = JSON.parse(
            localStorage.getItem("conversations") || "[]"
          );
          const updatedConversations = processConversationUpdate(
            updatedConversation,
            conversations
          );
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
        }

        setIsLoading(false);
      });

      emitter.on("stopped", () => {
        setStreamStopped(true);
        setIsLoading(false);
      });
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: "Sorry, there was an error processing your request. Please try again.",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        isBot: true,
        role: "assistant",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);

      // Save error message to conversation history
      if (activeConversation) {
        const updatedConversation = {
          ...activeConversation,
          messages: [...(activeConversation.messages || []), errorMessage],
        };

        updateConversation(updatedConversation);

        // Save to localStorage
        const conversations = JSON.parse(
          localStorage.getItem("conversations") || "[]"
        );
        const updatedConversations = processConversationUpdate(
          updatedConversation,
          conversations
        );
        localStorage.setItem("conversations", JSON.stringify(updatedConversations));
      }

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

    // Sort messages by timestamp to ensure chronological order
    const sortedMessages = [...messages].sort((a, b) => {
      // Compare by timestamp first
      const timeCompare = new Date(a.timestamp) - new Date(b.timestamp);
      // If timestamps are equal (which can happen with quick succession messages)
      // Use the sequence in the array as a tiebreaker
      return timeCompare !== 0
        ? timeCompare
        : messages.indexOf(a) - messages.indexOf(b);
    });

    // Find the last user message index
    let lastUserMessageIndex = -1;
    sortedMessages.forEach((msg, idx) => {
      if (!msg.isBot) {
        lastUserMessageIndex = idx;
      }
    });

    sortedMessages.forEach((message, index) => {
      const isLastMessageInStream = index === sortedMessages.length - 1;
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
          hasImages={
            message.hasImages || (message.images && message.images.length > 0)
          }
          isChunk={message.isChunk}
          isFinal={message.isFinal}
          threadId={message.threadId}
          onRegenerateResponse={
            message.isBot && isLastMessageInStream && message.isFinal
              ? handleRegenerate
              : undefined
          }
          logs={message.logs}
          isLoadingLogs={isLoading && isLastMessageInStream}
        />
      );

      // Only add thinking indicator after the last user message
      if (!message.isBot && index === lastUserMessageIndex && isLoading) {
        messageElements.push(
          <ThinkingIndicator
            key={`thinking-after-${message.id}`}
            text="Thinking"
            showSpinner={true}
          />
        );
      }
    });

    // Add the end of response indicator only at the very end
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    if (lastMessage && lastMessage.isBot && lastMessage.isFinal && !isLoading) {
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
      {}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "70px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {}
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
            overflow: "visible",
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
