import { postApi } from "./common"; // your helper
import { ensureAgentToken } from "../utils/agentToken";
import { v4 as uuidv4 } from "uuid";
import { CONFIG } from "../runtimeConfig";
let config = {
  model: "gpt-4.1-mini",
  maxTokens: 2000,
  temperature: "0",
  chatHistory: "15",
};

const buildPayload = (message, userInfo) => ({
  model: config.model,
  temperature: config.temperature,
  user: [
    {
      sub: userInfo?.email,
      email: userInfo?.email,
    },
  ],
  requestTime: Date.now().toString(),
  messages: [
    {
      prompt: message,
      adGroupName: CONFIG.AGENT_AD_GROUP_NAME,
    },
  ],
  maxTokens: config.maxTokens,
  chatHistory: config.chatHistory,
});

const sendMessage = async (userMessage, userInfo, sessionId) => {
  ensureAgentToken();
  const agentToken = JSON.parse(localStorage.getItem("agentToken"));
  const access_token = agentToken?.access_token;

  try {
    const payload = buildPayload(userMessage, userInfo);

    const response = await postApi(`agent/ask`, payload, {
      "X-Session-Id": sessionId, // Use conversation sessionId
      Authorization: `Bearer ${access_token}`,
    });

    //  Check for token limit exceeded
    if (response?.tokenLimitExceeded) {
      return {
        success: true,
        answer: response?.tokenLimitMessage || "Token limit exceeded! ",
        tableData: null,
        conversationId: null,
        raw: response,
      };
    }

    const sr = response?.structured_response || {};
    const structuredSummary = sr?.structured_summary || "";
    const messageText = response?.message || "";
    const smallTalkMsg = response?.smallTalkResponse || "";
    const tableData = sr?.tableData;
    const combinedAnswer = [structuredSummary, messageText, smallTalkMsg]
      .filter(Boolean)
      .join("\n");

    return {
      success: true,
      answer: combinedAnswer || "No Answer found",
      tableData: tableData,
      conversationId: response?.conversationId || null,
      raw: response,
    };
  } catch (error) {
    console.error("sendMessage error:", error);
    return {
      success: false,
      answer: "",
      error: error?.message || "Unknown error",
    };
  }
};

const sendFeedback = async (payload) => {
  ensureAgentToken();
  const agentToken = JSON.parse(localStorage.getItem("agentToken"));
  const access_token = agentToken?.access_token;

  try {
    const response = await postApi(
      `agent/feedback`,
      payload, // Send full payload including sessionId, messageId, score, category, comment, etc.
      {
        Authorization: `Bearer ${access_token}`,
      },
    );
    return response;
  } catch (error) {
    console.error("sendFeedback error:", error);
    throw error;
  }
};

export const agentService = {
  sendMessage,
  sendFeedback,
};
