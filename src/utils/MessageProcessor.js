import { fetchImageFromOpenAI } from "../services/ImageService";

/**
 * Utility class for message data processing tasks
 */
export class MessageProcessor {
  /**
   * Extract text content from different types of message content
   * @param {*} messageContent - The content from the API
   * @returns {string} Extracted text
   */
  static extractTextFromMessage(messageContent) {
    if (!messageContent) return "";

    if (typeof messageContent === "string") {
      return messageContent;
    }

    if (Array.isArray(messageContent)) {
      return messageContent
        .filter((block) => block.type === "text")
        .map((block) => block.text?.value || "")
        .join("\n");
    }

    if (messageContent.type === "text") {
      return messageContent.text?.value || "";
    }

    return JSON.stringify(messageContent);
  }

  /**
   * Parse message text for image references
   * @param {string} messageText
   * @returns {string|null} File ID if found, null otherwise
   */
  static parseMessageForImages(messageText) {
    if (!messageText) return null;

    const regex = /!\[(.*?)\]\(attachment:\/\/(.*?)\)/g;
    const matches = Array.from(messageText.matchAll(regex));

    if (matches && matches.length > 0) {
      const firstMatch = matches[0];
      return firstMatch[2];
    }
    return null;
  }

  /**
   * Extract content and images from message
   * @param {object} message - The message object
   * @returns {object} Content and images
   */
  static extractContentFromMessage(message) {
    let textContent = "";
    let imageFiles = [];

    if (!message.content || !Array.isArray(message.content)) {
      return { text: message.content || "", images: [] };
    }

    // Extract text and images from the message content
    for (const block of message.content) {
      if (block.type === "text") {
        const value = block.text?.value || "";
        textContent += value;

        // Extract image references from markdown format
        const regex = /!\[.*?\]\(attachment:\/\/(.*?)\)/g;
        let match;

        while ((match = regex.exec(value)) !== null) {
          const attachmentId = match[1];
          if (attachmentId) {
            imageFiles.push({
              fileId: attachmentId,
              url: null,
              isAttachment: true,
              position: match.index,
            });
          }
        }
      } else if (block.type === "code") {
        textContent += block.code?.value || "";
      } else if (block.type === "image_file") {
        imageFiles.push({
          fileId: block.image_file?.file_id,
          url: block.image_file?.url,
          isAttachment: false,
        });
      }
    }

    return { text: textContent, images: imageFiles };
  }

  /**
   * Format a conversation title from the first message
   * @param {string} message - The user message
   * @returns {string} A short title
   */
  static formatConversationTitle(message) {
    if (!message) return "New Conversation";

    const maxLength = 30;
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  }
}

export default MessageProcessor;
