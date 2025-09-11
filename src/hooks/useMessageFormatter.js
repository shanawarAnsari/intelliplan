import { useCallback } from "react";

const useMessageFormatter = () => {
  const formatForAzure = useCallback((content, role = "user") => {
    return {
      role: role,
      content: content,
    };
  }, []);
  const formatForUI = useCallback((message) => {
    let content = "";
    let isImage = false;
    let imageUrl = null;
    let imageFileId = null;
    let images = [];

    if (message.isImage) {
      isImage = true;
      imageUrl = message.imageUrl;
      imageFileId = message.imageFileId;
    }

    if (message.images && message.images.length > 0) {
      images = [...message.images];
    }

    if (message.content && Array.isArray(message.content)) {
      // Look for image files in the content
      const imageItems = message.content.filter(
        (item) => item.type === "image_file"
      );
      if (imageItems && imageItems.length > 0) {
        isImage = true;
        // Add all found images to the images array
        imageItems.forEach((item) => {
          if (item.image_file) {
            images.push({
              fileId: item.image_file.file_id,
              url: item.image_file.url || null,
            });

            // Keep the first one as the main image if we don't have one yet
            if (!imageFileId) {
              imageFileId = item.image_file.file_id;
              if (item.image_file.url) {
                imageUrl = item.image_file.url;
              }
            }
          }
        });
      }

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
      images: images.length > 0 ? images : undefined,
      hasImages: images.length > 0,
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
