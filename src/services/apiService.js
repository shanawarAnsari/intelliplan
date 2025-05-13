// API endpoints
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";
const ENDPOINTS = {
  SEND_MESSAGE: "/conversations/chat",
  CREATE_THREAD: "/threads",
  GET_CHAT_HISTORY: "/chat/history",
  CLEAR_CHAT: "/chat/clear",
};

/**
 * Service to handle API calls to the backend
 */
export const apiService = {
  /**
   * Create a new conversation thread
   * @returns {Promise<Object>} - The newly created thread object with ID
   */
  createThread: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_THREAD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create thread");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in createThread:", error);
      throw error;
    }
  },

  /**
   * Send a message to the Azure AI Assistant
   * @param {string} message - The message to send to the assistant
   * @param {string} assistantId - The ID of the assistant to use
   * @param {string} threadId - The thread ID for the conversation
   * @returns {Promise<Object>} - The response from the assistant
   */ sendMessageToAssistant: async (
    message,
    assistantId = null,
    threadId = null,
    cancelActiveRun = false
  ) => {
    try {
      // Add query parameter to cancel active run if needed
      const queryParams = cancelActiveRun ? "?cancelActiveRun=true" : "";
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.SEND_MESSAGE}${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            assistantId,
            threadId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Check if this is the active run error
        if (
          errorData.message &&
          errorData.message.includes("while a run is active")
        ) {
          throw new Error("ACTIVE_RUN_ERROR:" + errorData.message);
        }

        throw new Error(
          errorData.message || "Failed to get response from assistant"
        );
      }

      const responseData = await response.json();
      return {
        message: responseData.answer,
        threadId: responseData.conversationId,
        routeFunction: responseData.routeFunction,
      };
    } catch (error) {
      console.error("Error in sendMessageToAssistant:", error);
      throw error;
    }
  },

  /**
   * Get the chat history
   * @returns {Promise<Array>} - The chat history
   */
  getChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_CHAT_HISTORY}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get chat history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      throw error;
    }
  },

  /**
   * Clear the chat history
   * @returns {Promise<Object>} - Response confirming history cleared
   */
  clearChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CLEAR_CHAT}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear chat history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in clearChatHistory:", error);
      throw error;
    }
  },
};
