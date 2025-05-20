/**
 * Hooks-based utilities for managing conversation history
 */

// Save conversations to localStorage
export const saveConversations = (conversations) => {
  try {
    // Filter out any conversations without messages
    const validConversations = conversations.filter(
      (conv) => conv.messages && conv.messages.length > 0
    );

    localStorage.setItem("conversations", JSON.stringify(validConversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
  }
};

// Load conversations from localStorage
export const loadConversations = () => {
  try {
    const savedConversations = localStorage.getItem("conversations");
    if (savedConversations) {
      return JSON.parse(savedConversations);
    }
  } catch (error) {
    console.error("Error loading conversations from localStorage:", error);
  }
  return [];
};

// Filter valid conversations that have assistant messages
export const filterValidConversations = (conversations) => {
  return conversations.filter(
    (conv) => conv.messages && conv.messages.some((msg) => msg.role === "assistant")
  );
};

// Filter conversations for display (without thinking or chunk messages)
export const filterDisplayableConversations = (conversations) => {
  // Return all conversations that have at least one message
  return conversations.filter((conv) => conv.messages && conv.messages.length > 0);
};

// Add or update a conversation in the conversations array
export const updateConversationInList = (conversations, conversation) => {
  // Skip conversations with no messages
  if (!conversation.messages || conversation.messages.length === 0) {
    return conversations;
  }

  const index = conversations.findIndex((c) => c.id === conversation.id);

  if (index !== -1) {
    const updatedConversations = [...conversations];

    const existingMessages = updatedConversations[index].messages || [];
    const newMessages = conversation.messages || [];
    const existingMessageIds = new Set(existingMessages.map((msg) => msg.id));
    const messagesToAdd = newMessages.filter(
      (msg) => !existingMessageIds.has(msg.id)
    );
    const mergedMessages = [...existingMessages, ...messagesToAdd];
    updatedConversations[index] = {
      ...conversation,
      messages: mergedMessages,
    };

    return updatedConversations;
  } else {
    // For new conversations, ensure messages array exists and isn't empty
    return [
      ...conversations,
      {
        ...conversation,
        messages: conversation.messages || [],
      },
    ];
  }
};

// Update conversation in state and localStorage
export const processConversationUpdate = (updatedConv, prevConversations) => {
  // Skip conversations with no messages
  if (!updatedConv.messages || updatedConv.messages.length === 0) {
    return prevConversations;
  }

  // Store all conversations regardless of message type
  const updatedConversations = updateConversationInList(
    prevConversations,
    updatedConv
  );

  saveConversations(updatedConversations);

  return updatedConversations;
};

export const useConversationHistory = () => {
  return {
    saveConversations,
    loadConversations,
    filterValidConversations,
    filterDisplayableConversations,
    updateConversationInList,
    processConversationUpdate,
  };
};
