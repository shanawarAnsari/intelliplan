import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import useAzureOpenAI from "../services/useAzureOpenAI";

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
  } = useAzureOpenAI();

  // Initialize with sample conversations
  useEffect(() => {
    const initSampleConversations = () => {
      const sampleConversations = [
        {
          id: uuidv4(),
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
      setActiveConversation(sampleConversations[0]);
    };

    initSampleConversations();
  }, []);

  /**
   * Select a conversation by ID
   */
  const selectConversation = useCallback(
    (conversationId) => {
      const selected = conversations.find((conv) => conv.id === conversationId);
      if (selected) {
        setActiveConversation(selected);
        setThreadId(selected.id); // Set thread ID in Azure OpenAI service
      }
    },
    [conversations, setThreadId]
  );

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(
    (title) => {
      const newConversation = {
        id: uuidv4(),
        title: title || `New Conversation`,
        messages: [],
        created: new Date(),
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setThreadId(newConversation.id); // Set thread ID in Azure OpenAI service

      return newConversation;
    },
    [setThreadId]
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
        const response = await conversationHandler(message, activeConversation.id);

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
    [activeConversation, conversationHandler]
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
