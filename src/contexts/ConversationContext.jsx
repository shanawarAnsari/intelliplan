import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import useAzureOpenAI from "../services/useAzureOpenAI";
import useThreadValidator from "../hooks/useThreadValidator";

// Create context
const ConversationContext = createContext();

/**
 * Provider component for conversation management
 */
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

  // Initialize with sample conversations
  useEffect(() => {
    const initSampleConversations = async () => {
      try {
        // Create a valid thread for the first conversation
        const thread = await createThread();
        const threadId = thread?.id;

        const sampleConversations = [
          {
            id: threadId || uuidv4(),
            title: "Q3 Sales Analysis",
            messages: [
              {
                role: "user",
                content: "Can you analyze our Q3 sales performance?",
                timestamp: new Date(Date.now() - 3600000),
              },
              {
                role: "assistant",
                content:
                  "Based on the data, Q3 sales increased by 12% compared to Q2, with the strongest growth in the electronics category.",
                timestamp: new Date(Date.now() - 3590000),
              },
            ],
          },
          {
            id: uuidv4(),
            title: "Product Demand Forecast 2023",
            messages: [
              {
                role: "user",
                content: "What is the demand forecast for our product line in 2023?",
                timestamp: new Date(Date.now() - 7200000),
              },
              {
                role: "assistant",
                content:
                  "The forecast indicates a 15% growth in demand for premium products, while mid-range products may see steady demand with only 3% growth.",
                timestamp: new Date(Date.now() - 7190000),
              },
            ],
          },
        ];

        setConversations(sampleConversations);
        if (threadId) {
          setActiveConversation(sampleConversations[0]);
          setThreadId(threadId);
        } else {
          setActiveConversation(sampleConversations[1]);
        }
      } catch (error) {
        console.error("Error initializing sample conversations:", error);
      }
    };

    initSampleConversations();
  }, [createThread, setThreadId]);

  /**
   * Select a conversation by ID
   */
  const selectConversation = useCallback(
    async (conversationId) => {
      try {
        const selected = conversations.find((conv) => conv.id === conversationId);
        if (!selected) return;

        // First check if the thread exists/is valid
        const isValid = await validateThread(selected.id);

        if (isValid) {
          // Thread is valid, use it
          setActiveConversation(selected);
          setThreadId(formatThreadId(selected.id));
        } else {
          // Thread doesn't exist, create a new one
          const thread = await createThread();
          if (thread) {
            // Update conversation with new thread ID
            const updatedConversation = {
              ...selected,
              id: thread.id,
            };

            setActiveConversation(updatedConversation);
            setThreadId(thread.id);

            // Update in the conversations list
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === conversationId ? updatedConversation : conv
              )
            );
          }
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
      }
    },
    [conversations, setThreadId, validateThread, formatThreadId, createThread]
  );

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(
    async (title) => {
      try {
        // Always create a new thread
        const thread = await createThread();
        const threadId = thread?.id || uuidv4();

        const newConversation = {
          id: threadId,
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        if (thread) {
          setThreadId(threadId);
        }

        return newConversation;
      } catch (error) {
        console.error("Error creating new conversation:", error);

        // Fallback to UUID if thread creation fails
        const fallbackConversation = {
          id: uuidv4(),
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };

        setConversations((prev) => [fallbackConversation, ...prev]);
        setActiveConversation(fallbackConversation);

        return fallbackConversation;
      }
    },
    [createThread, setThreadId]
  );

  /**
   * Send a message in the active conversation
   */
  const sendMessage = useCallback(
    async (message) => {
      if (!activeConversation) {
        return null;
      }

      setIsLoading(true);

      try {
        // Add user message to the conversation
        const userMessage = {
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        const updatedMessages = [...activeConversation.messages, userMessage];
        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages,
        };

        // Update conversations state
        setActiveConversation(updatedConversation);
        setConversations((prev) => {
          return prev.map((conv) =>
            conv.id === activeConversation.id ? updatedConversation : conv
          );
        });

        // Send message to Azure OpenAI
        let response;
        try {
          response = await conversationHandler(message, activeConversation.id);
        } catch (error) {
          // If API call failed, might need a new thread
          const thread = await createThread();
          if (thread) {
            // Update conversation with new thread ID
            const reconversation = {
              ...updatedConversation,
              id: thread.id,
            };

            setActiveConversation(reconversation);
            setConversations((prev) => {
              return prev.map((conv) =>
                conv.id === activeConversation.id ? reconversation : conv
              );
            });

            // Try again with new thread
            response = await conversationHandler(message, thread.id);
          } else {
            throw error;
          }
        }

        // Add assistant message to the conversation
        if (response && response.answer) {
          const assistantMessage = {
            role: "assistant",
            content: response.answer,
            timestamp: new Date(),
          };

          const finalMessages = [...updatedMessages, assistantMessage];
          const finalConversation = {
            ...activeConversation,
            messages: finalMessages,
            // Update ID if response contains a new conversationId
            id: response.conversationId || activeConversation.id,
          };

          setActiveConversation(finalConversation);
          setConversations((prev) => {
            return prev.map((conv) =>
              conv.id === activeConversation.id ? finalConversation : conv
            );
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
    [activeConversation, conversationHandler, createThread, setThreadId]
  );

  const value = {
    conversations,
    activeConversation,
    isLoading: isLoading || isAILoading,
    error: aiError,
    selectConversation,
    createNewConversation,
    sendMessage,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

/**
 * Hook to use the conversation context
 */
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
};

export default ConversationContext;
