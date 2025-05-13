import azureOpenAIService from "./AzureOpenAIService";

class ConversationManager {
  constructor() {
    this.conversations = [];
    this.activeThreadId = null;
  }

  getConversationById(id) {
    return this.conversations.find((conv) => conv.id === id) || null;
  }

  async createConversation(title, threadId = null) {
    try {
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

  async sendMessageAndGetResponse(conversationId, message, assistantId = null) {
    try {
      this.addMessageToConversation(conversationId, message, "user");

      const response = await azureOpenAIService.conversationHandler(
        message,
        conversationId,
        assistantId || "asst_6VsHLyDwxFQhoxZakELHag4x"
      );

      if (response.answer) {
        this.addMessageToConversation(conversationId, response.answer, "assistant");
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  getAllConversations() {
    return this.conversations;
  }

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

const conversationManager = new ConversationManager();
export default conversationManager;
