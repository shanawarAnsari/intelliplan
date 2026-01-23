// contexts/ConversationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { agentService } from "../services/agentService";
import { loadConversations, saveConversations } from "../utils/storage";
import { MESSAGE_ROLES } from "../utils/constants";
import { generateConversationTitle } from "../utils/formatters";
import { useUserStore } from "../store/userStore";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUserStore();
  // In a real app, this comes from auth
  const userInfo = {
    sub: "ahmadshanawar.ansari@kcc.com",
    email: "ahmadshanawar.ansari@kcc.com",
    adGroupName: "KC_GENAI_OKTA_NONPROD_INTELLIPLAN",
  };

  // Initialize by loading saved conversations and start with a fresh one
  useEffect(() => {
    const loadSavedConversations = async () => {
      try {
        const parsedConversations = loadConversations();
        setConversations(parsedConversations);

        // Start with a new active conversation (not yet persisted)
        const newConversation = {
          id: uuidv4(),
          sessionId: uuidv4(), // ensure stable UUID per conversation
          title: "New Conversation",
          messages: [],
          created: new Date(),
        };
        setActiveConversation(newConversation);
      } catch (err) {
        console.error("Error initializing conversations:", err);
        setError(err.message);
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
      } catch (err) {
        console.error("Error selecting conversation:", err);
        setError(err.message);
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
        sessionId: uuidv4(), // new session id per conversation
        title: title ?? "New Conversation",
        messages: [],
        created: new Date(),
      };
      setActiveConversation(newConversation);
      setError(null);
      return newConversation;
    } catch (err) {
      console.error("Error creating new conversation:", err);
      setError(err.message);
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
        const existing = Array.isArray(activeConversation.messages)
          ? activeConversation.messages
          : [];
        // Append instead of resetting
        const updatedMessages = [...existing, userMessage];
        // Title from first message only
        const conversationTitle =
          existing.length === 0 ? generateConversationTitle(message) : activeConversation.title;
        const updatedConversation = {
          ...activeConversation,
          title: conversationTitle,
          messages: updatedMessages,
        };
        // Optimistic UI update
        setActiveConversation(updatedConversation);
        // Send message to REST API
        const response = await agentService.sendMessage(
          message,
          user
        );
        if (!response?.success) {
          setError(response?.error || "Failed to send message");
          setIsLoading(false);
          return response;
        }
        // Add assistant message to the conversation
        if (response.answer) {
          const assistantMessage = {
            role: MESSAGE_ROLES.ASSISTANT,
            content: response.answer,
            tableData: response.tableData,
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

          // Update conversation list (add or replace) and persist
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === activeConversation.id);
            let updatedConvs;
            if (idx >= 0) {
              updatedConvs = prev.map((c) => (c.id === activeConversation.id ? finalConversation : c));
            } else {
              updatedConvs = [finalConversation, ...prev];
            }
            saveConversations(updatedConvs);
            return updatedConvs;
          });
        }
        return response;
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.message);
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
      if (!activeConversation) return;

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
      } catch (err) {
        console.error("Error updating message feedback:", err);
        setError(err.message);
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