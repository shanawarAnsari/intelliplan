/**
 * Application-wide constants
 */

// UI Constants
export const DRAWER_WIDTH = 280;
export const MAX_MESSAGE_CHARS = 2000;
export const CHAR_COUNTER_THRESHOLD = 0.8; // Show counter at 80%

// Suggested prompts for empty state
export const SUGGESTED_PROMPTS = [
  "How do I get started?",
  "What can you help me with..?",
];

// Sort options
export const SORT_OPTIONS = {
  RECENT: "recent",
  ALPHABETICAL: "alphabetical",
};

// Message roles
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
};

// Local storage keys
export const STORAGE_KEYS = {
  CONVERSATIONS: "conversations",
};
