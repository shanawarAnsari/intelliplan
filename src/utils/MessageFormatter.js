// MessageFormatter.js - Utility for formatting messages

class MessageFormatter {
  /**
   * Format message from the UI for sending to Azure OpenAI
   * @param {string} content - The message content
   * @param {string} role - The role (user, assistant, system)
   * @returns {object} Formatted message for Azure OpenAI
   */
  static formatForAzure(content, role = "user") {
    return {
      role: role,
      content: content,
    };
  }

  /**
   * Format message from Azure OpenAI for the UI
   * @param {object} message - The message from Azure OpenAI
   * @returns {object} Formatted message for the UI
   */
  static formatForUI(message) {
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
  }

  /**
   * Format a list of messages from Azure OpenAI for the UI
   * @param {Array} messages - The messages from Azure OpenAI
   * @returns {Array} Formatted messages for the UI
   */
  static formatMessagesForUI(messages) {
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages.map((message) => this.formatForUI(message));
  }

  /**
   * Extract text content from complex message formats
   * @param {object|Array|string} content - The message content
   * @returns {string} The extracted text
   */
  static extractTextContent(content) {
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
  }
}

export default MessageFormatter;
