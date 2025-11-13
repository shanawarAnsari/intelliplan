import { CONFIG } from "../runtimeConfig";

const baseUrl = CONFIG.API_BASE_URL;

let config = {
  model: "gpt-4.1-mini",
  maxTokens: 2000,
  temperature: "0",
  chatHistory: "15"
};

const buildPayload = (message, userInfo) => {
  return {
    model: config.model,
    temperature: config.temperature,
    user: [
      {
        sub: userInfo?.sub || "user@example.com",
        email: userInfo?.email || "user@example.com"
      }
    ],
    requestTime: Date.now().toString(),
    messages: [
      {
        prompt: message,
        adGroupName: userInfo?.adGroupName || "KC_GENAI_OKTA_NONPROD_INTELLIPLAN"
      }
    ],
    maxTokens: config.maxTokens,
    chatHistory: config.chatHistory
  };
};

const sendMessage = async (userMessage, userInfo, sessionId, agentToken) => {
  try {
    const payload = buildPayload(userMessage, userInfo);

    const response = await fetch(`${baseUrl}/agent/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId || "",
        "Authorization": `Bearer ${agentToken}` // <-- Added Okta token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      answer: data.answer || data.response || data.message || "",
      conversationId: data.conversationId,
      success: true
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return {
      answer: `Sorry, I encountered an error: ${error.message}`,
      success: false,
      error: error.message
    };
  }
};

const setBaseUrl = (url) => {
  config.baseUrl = url;
};

const setConfig = (newConfig) => {
  if (newConfig.model) config.model = newConfig.model;
  if (newConfig.temperature) config.temperature = newConfig.temperature;
  if (newConfig.maxTokens) config.maxTokens = newConfig.maxTokens;
  if (newConfig.chatHistory) config.chatHistory = newConfig.chatHistory;
};

export const agentService = {
  sendMessage,
  setBaseUrl,
  setConfig
};