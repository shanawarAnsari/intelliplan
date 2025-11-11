import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import RestApiService from "../services/RestApiService";
import { loadConversations, saveConversations } from "../utils/storage";
import { MESSAGE_ROLES } from "../utils/constants";
import { generateConversationTitle } from "../utils/formatters";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // User information - in a real app, this would come from auth
  const userInfo = {
    sub: "ahmadshanawar.ansari@kcc.com",
    email: "ahmadshanawar.ansari@kcc.com",
    adGroupName: "KC_GENAI_OKTA_NONPROD_INTELLIPLAN",
  };

  // Initialize by loading saved conversations
  useEffect(() => {
    const loadSavedConversations = async () => {
      try {
        const parsedConversations = loadConversations();
        setConversations(parsedConversations);

        // Create a new conversation for the app start
        const newConversation = {
          id: uuidv4(),
          title: "New Conversation",
          messages: [],
          created: new Date(),
        };

        setActiveConversation(newConversation);
      } catch (error) {
        console.error("Error initializing conversations:", error);
        setError(error.message);
      }
    };

    loadSavedConversations();
  }, []);

  /**
   * Select a conversation by ID
   */
  const selectConversation = useCallback(
    (conversationId) => {
      try {
        const selected = conversations.find((conv) => conv.id === conversationId);
        if (selected) {
          setActiveConversation(selected);
          setError(null);
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
        setError(error.message);
      }
    },
    [conversations]
  );

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback((title) => {
    try {
      const newConversation = {
        id: uuidv4(),
        title: title || "New Conversation",
        messages: [],
        created: new Date(),
      };

      setActiveConversation(newConversation);
      setError(null);
      return newConversation;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      setError(error.message);
      return null;
    }
  }, []);

  /**
   * Send a message in the active conversation
   */
  const sendMessage = useCallback(
    async (message) => {
      if (!activeConversation) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userMessage = {
          role: MESSAGE_ROLES.USER,
          content: message,
          timestamp: new Date(),
        };

        const updatedMessages = [...activeConversation.messages, userMessage];

        // Generate title from first message if this is a new conversation
        const conversationTitle =
          updatedMessages.length === 1
            ? generateConversationTitle(message)
            : activeConversation.title;

        let updatedConversation = {
          ...activeConversation,
          title: conversationTitle,
          messages: updatedMessages,
        };

        // Update UI immediately with user message
        setActiveConversation(updatedConversation);

        // Send message to REST API
        const response = await RestApiService.sendConversationMessage(
          message,
          updatedMessages,
          userInfo
        );

        if (!response.success) {
          setError(response.error);
          setIsLoading(false);
          return response;
        }

        // Add assistant message to the conversation
        if (response.answer) {
          const assistantMessage = {
            role: MESSAGE_ROLES.ASSISTANT,
            content: response.answer,
            timestamp: new Date(),
            isImage: response.isImage || false,
            imageUrl: response.imageUrl || null,
            imageFileId: response.imageFileId || null,
            feedback: null, // Initialize feedback as null
          };

          const finalMessages = [...updatedMessages, assistantMessage];
          const finalConversation = {
            ...updatedConversation,
            messages: finalMessages,
            title: updatedConversation.title,
          };

          setActiveConversation(finalConversation);

          // Update conversations list
          setConversations((prev) => {
            const existingConvIndex = prev.findIndex(
              (conv) => conv.id === activeConversation.id
            );

            let updatedConversations;
            if (existingConvIndex >= 0) {
              updatedConversations = prev.map((conv) =>
                conv.id === activeConversation.id ? finalConversation : conv
              );
            } else {
              updatedConversations = [finalConversation, ...prev];
            }

            // Save updated conversations to localStorage
            saveConversations(updatedConversations);
            return updatedConversations;
          });
        }

        return response;
      } catch (error) {
        console.error("Error sending message:", error);
        setError(error.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, userInfo]
  );

  /**
   * Update message feedback (like/dislike)
   */
  const updateMessageFeedback = useCallback(
    (messageIndex, feedbackType) => {
      if (!activeConversation) {
        return;
      }

      try {
        const updatedMessages = activeConversation.messages.map((msg, idx) => {
          if (idx === messageIndex && msg.role === MESSAGE_ROLES.ASSISTANT) {
            return {
              ...msg,
              feedback: msg.feedback === feedbackType ? null : feedbackType, // Toggle feedback
            };
          }
          return msg;
        });

        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages,
        };

        setActiveConversation(updatedConversation);

        // Update conversations list and save to localStorage
        setConversations((prev) => {
          const updatedConversations = prev.map((conv) =>
            conv.id === activeConversation.id ? updatedConversation : conv
          );
          saveConversations(updatedConversations);
          return updatedConversations;
        });
      } catch (error) {
        console.error("Error updating message feedback:", error);
        setError(error.message);
      }
    },
    [activeConversation]
  );

  const value = {
    conversations,
    activeConversation,
    isLoading,
    error,
    selectConversation,
    createNewConversation,
    sendMessage,
    updateMessageFeedback,
    setConversations,
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
