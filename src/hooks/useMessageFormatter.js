import { useCallback } from "react";

const useMessageFormatter = () => {
  const formatForAzure = useCallback((content, role = "user") => {
    return {
      role: role,
      content: content,
    };
  }, []);
  const formatForUI = useCallback((message) => {
    // Handle different message content formats
    let content = "";
    let isImage = false;
    let imageUrl = null;
    let imageFileId = null;

    // Check if message has the isImage flag already set (from processed messages)
    if (message.isImage) {
      isImage = true;
      imageUrl = message.imageUrl;
      imageFileId = message.imageFileId;
    }

    if (message.content && Array.isArray(message.content)) {
      // Check for image file first
      const imageItem = message.content.find((item) => item.type === "image_file");
      if (imageItem && imageItem.image_file) {
        isImage = true;
        imageFileId = imageItem.image_file.file_id;

        // Get URL if available, otherwise it will be loaded later
        if (imageItem.image_file.url) {
          imageUrl = imageItem.image_file.url;
        } else if (imageFileId) {
          // Create placeholder for image that will be loaded
          console.log(`Image file ID detected: ${imageFileId}`);
        }
      }

      // Get text content as well
      content = message.content
        .map((item) => {
          if (item.type === "text") {
            return item.text?.value || "";
          }
          return "";
        })
        .join("\n")
        .trim();
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
      isImage,
      imageUrl,
      imageFileId,
    };
  }, []);
  const formatMessagesForUI = useCallback(
    (messages) => {
      if (!Array.isArray(messages)) {
        return [];
      }

      return messages.map((message) => formatForUI(message));
    },
    [formatForUI]
  );
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
