class MessageFormatter {
  static formatForAzure(content, role = "user") {
    return {
      role: role,
      content: content,
    };
  }

  static formatForUI(message) {
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

  static formatMessagesForUI(messages) {
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages.map((message) => this.formatForUI(message));
  }

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
