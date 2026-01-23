/**
 * LocalStorage utilities
 */
import { STORAGE_KEYS } from "./constants";

/**
 * Save conversations to localStorage
 */
export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error("Error saving conversations:", error);
    return false;
  }
};

/**
 * Load conversations from localStorage
 */
export const loadConversations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    // Filter out conversations with no messages
    return parsed.filter((conv) => conv.messages && conv.messages.length > 0);
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
};

/**
 * Clear all conversations from localStorage
 */
export const clearConversations = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    return true;
  } catch (error) {
    console.error("Error clearing conversations:", error);
    return false;
  }
};
