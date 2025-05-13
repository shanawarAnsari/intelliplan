import { useState, useCallback } from "react";
import { openAIClient } from "../utils/openAIClient";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
} from "../utils/assistantConstants";

/**
 * React hook for Azure OpenAI interactions
 * Simplified version to only include core functionality needed by components
 */
const useAzureOpenAI = () => {
  const [client] = useState(openAIClient);
  const [assistantId, setAssistantId] = useState(COORDINATOR_ASSISTANT_ID);
  const [currentAssistantName, setCurrentAssistantName] = useState("Coordinator");
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  /**
   * Creates a new thread
   */
  const createThread = useCallback(async () => {
    if (!client) return null;

    setIsLoading(true);
    setError(null);

    try {
      const thread = await client.beta.threads.create({});

      const formattedThreadId = thread.id.startsWith("thread_")
        ? thread.id
        : `thread_${thread.id}`;

      setThreadId(formattedThreadId);

      return { ...thread, id: formattedThreadId };
    } catch (err) {
      console.error(`Error creating thread: ${err.message}`);
      setError(`Error creating thread: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  /**
   * Extracts text content from various message formats
   */
  const extractTextFromMessage = useCallback((messageContent) => {
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
  }, []);

  /**
   * Main handler for conversation interactions
   * This is the primary method that should be used by components
   */
  const conversationHandler = useCallback(
    async (message, conversationId = null, specificAssistantId = null) => {
      if (!client) {
        setError("OpenAI client not initialized");
        return {
          answer: "Sorry, the AI service is not available right now.",
          error: true,
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        // Format thread ID consistently
        let useThreadId = conversationId;
        if (useThreadId && !useThreadId.startsWith("thread_")) {
          useThreadId = `thread_${useThreadId}`;
        }

        // Create thread if needed
        if (!useThreadId) {
          const newThread = await createThread();
          useThreadId = newThread?.id;

          if (!useThreadId) {
            throw new Error("Failed to create thread");
          }
        }

        // Add the user message to the thread
        await client.beta.threads.messages.create(useThreadId, {
          role: "user",
          content: message,
        });

        // Use coordinator by default or specified assistant
        const useAssistantId = specificAssistantId || assistantId;

        // Create and execute the run
        const run = await client.beta.threads.runs.create(useThreadId, {
          assistant_id: useAssistantId,
        });

        // Wait for completion
        let currentRun = run;

        while (["queued", "in_progress"].includes(currentRun.status)) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          currentRun = await client.beta.threads.runs.retrieve(
            useThreadId,
            currentRun.id
          );

          // Handle tool calls if needed (simplifying this complex logic here)
          if (
            currentRun.status === "requires_action" &&
            currentRun.required_action
          ) {
            console.log(
              "Run requires action - this simplified version doesn't handle tool calls"
            );
            // In a complete implementation, this would handle tool calls for routing to specialized assistants
            break;
          }
        }

        // Check for completion
        if (currentRun.status === "completed") {
          const messagesResponse = await client.beta.threads.messages.list(
            useThreadId,
            { order: "desc", limit: 1 }
          );

          if (messagesResponse.data.length > 0) {
            const lastMessage = messagesResponse.data[0];
            const answerText = extractTextFromMessage(lastMessage.content);

            return {
              answer: answerText,
              conversationId: useThreadId,
              assistantName: "Assistant", // Simplified - no assistant name handling
            };
          }
        }

        throw new Error(`Run failed with status: ${currentRun.status}`);
      } catch (err) {
        console.error("Error in conversation handler:", err);
        setError("Error in conversation handler: " + err.message);
        return {
          answer:
            "Sorry, I encountered an error processing your request: " + err.message,
          conversationId: threadId,
          error: true,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [client, threadId, assistantId, createThread, extractTextFromMessage]
  );

  // Return only essential elements needed by consuming components
  return {
    client,
    assistantId,
    currentAssistantName,
    threadId,
    isLoading,
    error,
    createThread,
    conversationHandler,
    setThreadId,
  };
};

export default useAzureOpenAI;
