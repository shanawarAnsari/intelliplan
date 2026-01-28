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

  const userInfo = {
    sub: "ahmadshanawar.ansari@kcc.com",
    email: "ahmadshanawar.ansari@kcc.com",
    adGroupName: "KC_GENAI_OKTA_NONPROD_INTELLIPLAN",
  };

  useEffect(() => {
    const loadSavedConversations = async () => {
      try {
        const parsedConversations = loadConversations();
        setConversations(parsedConversations);

        const newConversation = {
          id: uuidv4(),
          sessionId: uuidv4(),
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
    [conversations],
  );

  const createNewConversation = useCallback((title) => {
    try {
      const newConversation = {
        id: uuidv4(),
        sessionId: uuidv4(),
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

  const sendMessage = useCallback(
    async (message) => {
      if (!activeConversation) {
        const errorMsg = "No active conversation";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      setIsLoading(true);
      setError(null);
      try {
        const userMessage = {
          id: uuidv4(),
          role: MESSAGE_ROLES.USER,
          content: message,
          timestamp: new Date(),
        };
        const existing = Array.isArray(activeConversation.messages)
          ? activeConversation.messages
          : [];

        const updatedMessages = [...existing, userMessage];

        const conversationTitle =
          existing.length === 0
            ? generateConversationTitle(message)
            : activeConversation.title;
        const updatedConversation = {
          ...activeConversation,
          title: conversationTitle,
          messages: updatedMessages,
        };

        setActiveConversation(updatedConversation);

        const response = await agentService.sendMessage(
          message,
          user,
          activeConversation.sessionId,
        );

        if (!response?.success) {
          const errorMsg = response?.error || "Failed to send message";
          setError(errorMsg);
          setIsLoading(false);
          return { success: false, error: errorMsg };
        }

        if (response.answer) {
          const assistantMessage = {
            id: uuidv4(),
            role: MESSAGE_ROLES.ASSISTANT,
            content: response.answer,
            tableData: response.tableData,
            timestamp: new Date(),
            isImage: response.isImage || false,
            imageUrl: response.imageUrl || null,
            imageFileId: response.imageFileId || null,
            feedback: null,
          };
          const finalMessages = [...updatedMessages, assistantMessage];
          const finalConversation = {
            ...updatedConversation,
            messages: finalMessages,
            title: updatedConversation.title,
          };

          setActiveConversation(finalConversation);

          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === activeConversation.id);
            let updatedConvs;
            if (idx >= 0) {
              updatedConvs = prev.map((c) =>
                c.id === activeConversation.id ? finalConversation : c,
              );
            } else {
              updatedConvs = [finalConversation, ...prev];
            }
            saveConversations(updatedConvs);
            return updatedConvs;
          });
        }
        setIsLoading(false);
        return { success: true, ...response };
      } catch (err) {
        console.error("Error sending message:", err);
        const errorMsg = err.message || "An unexpected error occurred";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    [activeConversation, user],
  );

  const updateMessageFeedback = useCallback(
    async (payload) => {
      if (!activeConversation) {
        const errorMsg = "No active conversation";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const {
        sessionId,
        messageId,
        score,
        categoriesText,
        comment,
        requestTime,
        ...rest
      } = payload;

      try {
        setError(null);

        const messageIndex = activeConversation.messages.findIndex(
          (msg) => msg.id === messageId && msg.role === MESSAGE_ROLES.ASSISTANT,
        );
        if (messageIndex === -1) {
          throw new Error("Message not found");
        }

        const response = await agentService.sendFeedback(payload);

        if (response === false || (response && response.success === false)) {
          throw new Error(response?.error || "Failed to submit feedback");
        }

        const updatedMessages = activeConversation.messages.map((msg, idx) => {
          if (idx === messageIndex) {
            return {
              ...msg,
              feedback: {
                score: parseInt(score),
                categoriesText,
                comment,
                submittedAt: requestTime,
              },
            };
          }
          return msg;
        });

        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages,
        };

        setActiveConversation(updatedConversation);

        setConversations((prev) => {
          const updatedConversations = prev.map((conv) =>
            conv.id === activeConversation.id ? updatedConversation : conv,
          );
          saveConversations(updatedConversations);
          return updatedConversations;
        });

        return { success: true };
      } catch (err) {
        console.error("Error updating message feedback:", err);
        const errorMsg = err.message || "Failed to submit feedback";
        setError(errorMsg);

        throw new Error(errorMsg);
      }
    },
    [activeConversation],
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
