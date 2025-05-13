import React, { createContext, useState, useContext, useEffect } from "react";
import useAzureOpenAI from "../services/useAzureOpenAI";
import useMessageFormatter from "../hooks/useMessageFormatter";

const ConversationContext = createContext();

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { formatMessagesForUI } = useMessageFormatter();
  const { conversationHandler, getThreadMessages } = useAzureOpenAI();

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadConversations = () => {
      try {
        const savedConversations = localStorage.getItem("conversations");
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);

          // Set active conversation to the most recent one if it exists
          if (parsedConversations.length > 0) {
            const mostRecent = parsedConversations[0];
            setActiveConversation(mostRecent);
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        setError("Failed to load conversation history");
      }
    };

    loadConversations();
  }, []);

  // Create a new conversation
  const createNewConversation = async (title) => {
    try {
      setIsLoading(true);

      // Create a default title if none provided
      const conversationTitle =
        title || `Conversation ${new Date().toLocaleString()}`;

      // Create a new conversation object
      const newConversation = {
        id: `conv_${Date.now()}`,
        title: conversationTitle,
        createdAt: new Date().toISOString(),
        messages: [],
        threadId: null,
      };

      // Update state with the new conversation
      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      setActiveConversation(newConversation);

      // Save to localStorage
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      return newConversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to create a new conversation");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Select an existing conversation
  const selectConversation = async (conversationId) => {
    try {
      const conversation = conversations.find((conv) => conv.id === conversationId);
      if (!conversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
      }

      setActiveConversation(conversation);
      return conversation;
    } catch (error) {
      console.error("Error selecting conversation:", error);
      setError(`Failed to select conversation: ${error.message}`);
      return null;
    }
  };

  // Send a message in the active conversation
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ensure there's an active conversation
      let currentConversation = activeConversation;

      // If no active conversation, create a new one
      if (!currentConversation) {
        currentConversation = await createNewConversation();
      }

      // Add user message to conversation
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      currentConversation.messages.push(userMessage);

      // Create a temporary updated state for optimistic UI update
      const updatedConversations = conversations.map((conv) =>
        conv.id === currentConversation.id ? currentConversation : conv
      );

      // If this is a new conversation added to the beginning, ensure it's still there
      if (!updatedConversations.some((conv) => conv.id === currentConversation.id)) {
        updatedConversations.unshift(currentConversation);
      }

      // Update state with the user message
      setConversations(updatedConversations);
      setActiveConversation({ ...currentConversation });

      // Save to localStorage for persistence
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      // Send message to API
      const response = await conversationHandler(
        message,
        currentConversation.threadId
      );

      // Add the threadId to the conversation if it's new
      if (!currentConversation.threadId && response.conversationId) {
        currentConversation.threadId = response.conversationId;
      }

      // Add assistant response to conversation with image handling
      const assistantMessage = {
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        isImage: response.isImage || false,
        imageUrl: response.imageUrl || null,
        imageFileId: response.imageFileId || null,
      };

      currentConversation.messages.push(assistantMessage);

      // If this is the first message, update the title based on the content
      if (
        currentConversation.messages.length <= 2 &&
        currentConversation.title.startsWith("Conversation")
      ) {
        // Create a title from user's first message - limit to first 30 chars
        const shortTitle =
          message.length > 30 ? message.substring(0, 30) + "..." : message;
        currentConversation.title = shortTitle;
      }

      // Update conversation list with the updated conversation
      const finalUpdatedConversations = conversations.map((conv) =>
        conv.id === currentConversation.id ? currentConversation : conv
      );

      // Ensure the conversation is in the list (for new conversations)
      if (
        !finalUpdatedConversations.some((conv) => conv.id === currentConversation.id)
      ) {
        finalUpdatedConversations.unshift(currentConversation);
      }

      // Sort by most recent interaction
      finalUpdatedConversations.sort((a, b) => {
        const aTime =
          a.messages.length > 0
            ? new Date(a.messages[a.messages.length - 1].timestamp).getTime()
            : new Date(a.createdAt).getTime();

        const bTime =
          b.messages.length > 0
            ? new Date(b.messages[b.messages.length - 1].timestamp).getTime()
            : new Date(b.createdAt).getTime();

        return bTime - aTime; // Most recent first
      });

      setConversations(finalUpdatedConversations);
      setActiveConversation({ ...currentConversation });

      // Save updated conversations to localStorage
      localStorage.setItem(
        "conversations",
        JSON.stringify(finalUpdatedConversations)
      );

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);

      // Add error message to conversation
      if (activeConversation) {
        const errorMessage = {
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        };

        activeConversation.messages.push(errorMessage);
        setActiveConversation({ ...activeConversation });

        // Update in conversation list
        const updatedConversations = conversations.map((conv) =>
          conv.id === activeConversation.id ? activeConversation : conv
        );

        setConversations(updatedConversations);
        localStorage.setItem("conversations", JSON.stringify(updatedConversations));
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a conversation
  const deleteConversation = (conversationId) => {
    try {
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      setConversations(updatedConversations);

      // If active conversation is deleted, set to most recent or null
      if (activeConversation && activeConversation.id === conversationId) {
        const newActive =
          updatedConversations.length > 0 ? updatedConversations[0] : null;
        setActiveConversation(newActive);
      }

      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Failed to delete conversation");
      return false;
    }
  };

  const value = {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    isLoading,
    error,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
