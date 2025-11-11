/**
 * Date and time formatting utilities
 */

/**
 * Format time for message timestamps
 */
export const formatTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format date for conversation history
 */
export const getFormattedDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (d.getFullYear() === today.getFullYear()) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

/**
 * Generate a conversation title from the first user message
 * @param {string} message - The first user message
 * @returns {string} - A truncated title
 */
export const generateConversationTitle = (message) => {
  if (!message || typeof message !== "string") {
    return "New Conversation";
  }

  // Remove extra whitespace and newlines
  const cleaned = message.trim().replace(/\s+/g, " ");

  // Truncate to a reasonable length (50 characters)
  const maxLength = 50;
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
};
