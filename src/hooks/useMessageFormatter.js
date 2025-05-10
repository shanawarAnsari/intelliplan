import { useCallback } from "react";

/**
 * Custom hook for formatting messages
 */
const useMessageFormatter = () => {
  /**
   * Format message from the UI for sending to Azure OpenAI
   */
  const formatForAzure = useCallback((content, role = "user") => {
    return {
      role: role,
      content: content,
    };
  }, []);

  /**
   * Format message from Azure OpenAI for the UI
   */
  const formatForUI = useCallback((message) => {
    // Handle different message content formats
    let content = "";

    if (message.content && Array.isArray(message.content)) {
      content = message.content
        .map((item) => {
          if (item.type === "text") {
            return item.text?.value || "";
          }
          return "";
        })
        .join("\n");
    } else if (typeof message.content === "string") {
      content = message.content;
    }

    return {
      text: content,
      isBot: message.role === "assistant",
      timestamp: message.created_at
        ? new Date(message.created_at * 1000)
        : new Date(),
      id: message.id || `msg-${Date.now()}`,
    };
  }, []);

  /**
   * Format a list of messages from Azure OpenAI for the UI
   */
  const formatMessagesForUI = useCallback(
    (messages) => {
      if (!Array.isArray(messages)) {
        return [];
      }

      return messages.map((message) => formatForUI(message));
    },
    [formatForUI]
  );

  /**
   * Extract text content from complex message formats
   */
  const extractTextContent = useCallback((content) => {
    if (!content) return "";

    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (item.type === "text") {
            return item.text?.value || "";
          }
          return "";
        })
        .join("\n");
    }

    if (content.type === "text") {
      return content.text?.value || "";
    }

    return JSON.stringify(content);
  }, []);

  return {
    formatForAzure,
    formatForUI,
    formatMessagesForUI,
    extractTextContent,
  };
};

export default useMessageFormatter;
