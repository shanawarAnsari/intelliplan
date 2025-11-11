/**
 * REST API Service for communication with backend agents
 * Handles all API requests with standardized payload format
 */

class RestApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";
    this.model = "gpt-4.1-mini";
    this.maxTokens = 2000;
    this.temperature = "0";
    this.chatHistory = "15";
  }

  /**
   * Build the standardized payload for API requests
   */
  buildPayload(messages, userInfo) {
    return {
      model: this.model,
      temperature: this.temperature,
      user: [
        {
          sub: userInfo?.sub || "user@example.com",
          email: userInfo?.email || "user@example.com",
        },
      ],
      requestTime: Date.now().toString(),
      messages: messages.map((msg) => ({
        prompt: msg.content || msg.prompt,
        adGroupName: userInfo?.adGroupName || "KC_GENAI_OKTA_NONPROD_INTELLIPLAN",
      })),
      maxTokens: this.maxTokens,
      chatHistory: this.chatHistory,
    };
  }

  /**
   * Send message to the API and get response
   */
  async sendMessage(userMessage, userInfo) {
    try {
      const payload = this.buildPayload([{ content: userMessage }], userInfo);

      const response = await fetch(`${this.baseUrl}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        answer: data.answer || data.response || data.message || "",
        conversationId: data.conversationId,
        success: true,
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return {
        answer: `Sorry, I encountered an error: ${error.message}`,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send multiple messages in conversation context
   */
  async sendConversationMessage(currentMessage, chatHistory = [], userInfo) {
    try {
      const messages = [
        ...chatHistory.map((msg) => ({
          content: msg.content || msg.text,
          role: msg.role,
        })),
        { content: currentMessage },
      ];

      const payload = this.buildPayload(messages, userInfo);

      const response = await fetch(`${this.baseUrl}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        answer: data.answer || data.response || data.message || "",
        conversationId: data.conversationId,
        success: true,
      };
    } catch (error) {
      console.error("Error in sendConversationMessage:", error);
      return {
        answer: `Sorry, I encountered an error: ${error.message}`,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set API base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
  }

  /**
   * Set model configuration
   */
  setConfig(config) {
    if (config.model) this.model = config.model;
    if (config.temperature) this.temperature = config.temperature;
    if (config.maxTokens) this.maxTokens = config.maxTokens;
    if (config.chatHistory) this.chatHistory = config.chatHistory;
  }
}

export default new RestApiService();
