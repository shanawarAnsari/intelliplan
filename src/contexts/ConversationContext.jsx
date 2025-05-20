import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import useAzureOpenAI from "../hooks/useAzureOpenAI";
import useThreadValidator from "../hooks/useThreadValidator";
import MessageProcessor from "../utils/MessageProcessor";
import {
  saveConversations,
  loadConversations,
  filterDisplayableConversations,
  processConversationUpdate,
} from "../hooks/useConversationHistory";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    conversationHandler,
    setThreadId,
    isLoading: isAILoading,
    error: aiError,
    createThread,
  } = useAzureOpenAI();
  const { validateThread, formatThreadId } = useThreadValidator();
  useEffect(() => {
    const loadSavedConversations = async () => {
      try {
        // Load conversations from localStorage using the utility
        const loadedConversations = loadConversations();

        // Get all valid conversations but only display those with complete assistant messages
        const validConversations =
          filterDisplayableConversations(loadedConversations);
        setConversations(validConversations);

        // Create a new thread and set it as active conversation
        const thread = await createThread();
        if (thread) {
          const newConversation = {
            id: thread.id,
            title: "New Conversation",
            messages: [],
            created: new Date(),
          };
          setActiveConversation(newConversation);
          setThreadId(thread.id);
        }
      } catch (error) {
        console.error("Error initializing conversations:", error);
      }
    };

    loadSavedConversations();
  }, [createThread, setThreadId]);

  const selectConversation = useCallback(
    async (conversationId) => {
      try {
        const selected = conversations.find((conv) => conv.id === conversationId);
        if (!selected) return;
        const isValid = await validateThread(selected.id);

        if (isValid) {
          setActiveConversation(selected);
          setThreadId(formatThreadId(selected.id));
        } else {
          const thread = await createThread();
          if (thread) {
            const updatedConversation = {
              ...selected,
              id: thread.id,
            };

            setActiveConversation(updatedConversation);
            setThreadId(thread.id);
            setConversations((prev) => {
              const updated = prev.map((conv) =>
                conv.id === conversationId ? updatedConversation : conv
              );
              saveConversations(updated);
              return updated;
            });
          }
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
      }
    },
    [conversations, setThreadId, validateThread, formatThreadId, createThread]
  );
  const createNewConversation = useCallback(
    async (title) => {
      try {
        const thread = await createThread();
        const threadId = thread?.id || uuidv4();
        const newConversation = {
          id: threadId,
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };
        setConversations((prev) => {
          const validPrevConversations = filterDisplayableConversations(prev);
          const updatedConversations = [...validPrevConversations, newConversation];

          saveConversations(updatedConversations);
          return updatedConversations;
        });

        setActiveConversation(newConversation);
        if (thread) {
          setThreadId(threadId);
        }

        return newConversation;
      } catch (error) {
        console.error("Error creating new conversation:", error);

        const fallbackConversation = {
          id: uuidv4(),
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };
        setConversations((prev) => {
          const updatedConversations = [...prev, fallbackConversation];
          saveConversations(updatedConversations);
          return updatedConversations;
        });

        setActiveConversation(fallbackConversation);

        return fallbackConversation;
      }
    },
    [createThread, setThreadId]
  );

  const sendMessage = useCallback(
    async (message) => {
      if (!activeConversation) {
        return null;
      }

      setIsLoading(true);

      try {
        const userMessage = {
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        const updatedMessages = [...activeConversation.messages, userMessage];
        let updatedConversation = {
          ...activeConversation,
          messages: updatedMessages,
        };

        setActiveConversation(updatedConversation);
        setConversations((prev) => {
          const conversationExists = prev.some(
            (conv) => conv.id === activeConversation.id
          );
          let updated;
          if (conversationExists) {
            updated = prev.map((conv) =>
              conv.id === activeConversation.id ? updatedConversation : conv
            );
          } else {
            updated = [...prev, updatedConversation];
          }

          saveConversations(updated);
          return updated;
        });

        const response = await conversationHandler(
          message,
          activeConversation.id,
          "asst_6VsHLyDwxFQhoxZakELHag4x"
        );

        if (response) {
          const assistantMessage = {
            role: "assistant",
            content: response.answer || "",
            timestamp: new Date(),
            assistantName: response.assistantName || "Assistant",
            routedFrom: response.routedFrom || null,
          };

          const finalMessages = [...updatedMessages, assistantMessage];

          const finalConversation = {
            ...updatedConversation,
            messages: finalMessages,
            title:
              updatedConversation.title === "New Conversation" &&
              finalMessages.length <= 2
                ? MessageProcessor.formatConversationTitle(message)
                : updatedConversation.title,
          };

          setActiveConversation(finalConversation);
          setConversations((prev) => {
            const exists = prev.some((conv) => conv.id === activeConversation.id);
            let updated;

            if (exists) {
              updated = prev.map((conv) =>
                conv.id === activeConversation.id ? finalConversation : conv
              );
            } else {
              updated = [...prev, finalConversation];
            }

            saveConversations(updated);
            return updated;
          });
        }

        return response;
      } catch (error) {
        console.error("Error sending message:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, conversationHandler]
  );

  const addAssistantMessageToConversation = useCallback(
    (content, assistantName, routedFrom) => {
      if (!activeConversation) return;

      const assistantMessage = {
        role: "assistant",
        content: content,
        timestamp: new Date(),
        assistantName: assistantName || "Assistant",
        routedFrom: routedFrom,
      };

      const updatedMessages = [...activeConversation.messages, assistantMessage];
      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages,
      };

      setActiveConversation(updatedConversation);
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.id === activeConversation.id);
        let updated;

        if (exists) {
          updated = prev.map((conv) =>
            conv.id === activeConversation.id ? updatedConversation : conv
          );
        } else {
          updated = [...prev, updatedConversation];
        }

        saveConversations(updated);
        return updated;
      });

      return assistantMessage;
    },
    [activeConversation]
  );
  const updateConversation = useCallback((updatedConv) => {
    setConversations((prevConversations) => {
      return processConversationUpdate(updatedConv, prevConversations);
    });
  }, []);

  const value = {
    conversations,
    activeConversation,
    isLoading: isLoading || isAILoading,
    error: aiError,
    selectConversation,
    createNewConversation,
    sendMessage,
    addAssistantMessageToConversation,
    setConversations,
    updateConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
};

export default ConversationContext;
