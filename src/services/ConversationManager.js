// ConversationManager.js - Manages conversation threads and history
import azureOpenAIService from "./AzureOpenAIService";

class ConversationManager {
  constructor() {
    this.conversations = [];
    this.activeThreadId = null;
  }

  /**
   * Get a conversation by ID
   * @param {string} id - The conversation ID
   * @returns {object|null} The conversation object or null if not found
   */
  getConversationById(id) {
    return this.conversations.find((conv) => conv.id === id) || null;
  }

  /**
   * Create a new conversation
   * @param {string} title - The conversation title
   * @param {string} threadId - Optional thread ID from Azure OpenAI
   * @returns {object} The new conversation object
   */
  async createConversation(title, threadId = null) {
    try {
      // If no threadId is provided, create a new thread
      if (!threadId) {
        const threadResponse = await azureOpenAIService.createThread();
        threadId = threadResponse.id;
      }

      const newConversation = {
        id: threadId,
        title: title || `Conversation ${this.conversations.length + 1}`,
        createdAt: new Date(),
        messages: [],
        threadId: threadId,
      };

      this.conversations.unshift(newConversation);
      this.activeThreadId = threadId;
      return newConversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  /**
   * Add a message to a conversation
   * @param {string} conversationId - The conversation ID
   * @param {string} content - The message content
   * @param {string} role - The message role (user or assistant)
   * @returns {object} The updated conversation
   */
  addMessageToConversation(conversationId, content, role = "user") {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    const message = {
      id: `msg-${Date.now()}`,
      content: content,
      role: role,
      timestamp: new Date(),
    };

    conversation.messages.push(message);
    return conversation;
  }

  /**
   * Send a message and get a response
   * @param {string} conversationId - The conversation ID
   * @param {string} message - The message content
   * @returns {object} The response from the assistant
   */
  async sendMessageAndGetResponse(conversationId, message) {
    try {
      // Add user message to conversation
      this.addMessageToConversation(conversationId, message, "user");

      // Send message to Azure OpenAI
      const response = await azureOpenAIService.conversationHandler(
        message,
        conversationId
      );

      // Add assistant response to conversation
      if (response.answer) {
        this.addMessageToConversation(conversationId, response.answer, "assistant");
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Get all conversations
   * @returns {Array} All conversations
   */
  getAllConversations() {
    return this.conversations;
  }

  /**
   * Export conversation history
   * @param {string} conversationId - The conversation ID
   * @returns {object} The conversation history in a format ready for export
   */
  exportConversationHistory(conversationId) {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return {
      title: conversation.title,
      id: conversation.id,
      createdAt: conversation.createdAt,
      messages: conversation.messages,
      exportedAt: new Date(),
    };
  }
}

// Export singleton instance
const conversationManager = new ConversationManager();
export default conversationManager;
