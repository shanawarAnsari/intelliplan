import { useState, useEffect, useCallback, useRef } from "react";
import { openAIClient } from "../utils/openAIClient";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
} from "../utils/assistantConstants";

const useAzureOpenAI = () => {
  const [client, setClient] = useState(openAIClient);
  const [assistantId, setAssistantId] = useState(COORDINATOR_ASSISTANT_ID);
  const [currentAssistantName, setCurrentAssistantName] = useState("Coordinator");
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

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

  const sendMessage = useCallback(
    async (message, currentThreadId = null) => {
      if (!client) return null;

      setIsLoading(true);
      setError(null);

      try {
        let activeThreadId = currentThreadId || threadId;

        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        let useThreadId = activeThreadId;
        if (!useThreadId) {
          const newThread = await createThread();
          useThreadId = newThread.id;
        }

        try {
          await client.beta.threads.messages.create(useThreadId, {
            role: "user",
            content: message,
          });

          return { threadId: useThreadId };
        } catch (threadError) {
          console.error("Error sending message:", threadError);
          return null;
        }
      } catch (err) {
        console.error(`Error sending message: ${err.message}`);
        setError(`Error sending message: ${err.message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, threadId, createThread]
  );

  const processMessageContent = useCallback(async (content) => {
    if (!content || !Array.isArray(content)) return content;

    const processedContent = [...content];

    for (let i = 0; i < processedContent.length; i++) {
      const item = processedContent[i];

      if (item.type === "image_file" && item.image_file && item.image_file.file_id) {
        // Process image content if needed
      }
    }

    return processedContent;
  }, []);

  const runAssistant = useCallback(
    async (currentAssistantId = null, currentThreadId = null) => {
      if (!client) return null;

      setIsLoading(true);
      setError(null);

      try {
        let activeAssistantId = currentAssistantId || assistantId;
        let activeThreadId = currentThreadId || threadId;

        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        if (!activeThreadId) {
          const newThread = await createThread();
          activeThreadId = newThread.id;
        }

        try {
          const run = await client.beta.threads.runs.create(activeThreadId, {
            assistant_id: activeAssistantId,
          });

          let runStatus = run.status;
          let currentRun = run;

          while (runStatus === "queued" || runStatus === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            currentRun = await client.beta.threads.runs.retrieve(
              activeThreadId,
              currentRun.id
            );
            runStatus = currentRun.status;
          }

          if (runStatus === "completed") {
            const messagesResponse = await client.beta.threads.messages.list(
              activeThreadId,
              { order: "desc", limit: 1 }
            );

            if (messagesResponse.data.length > 0) {
              const lastMessage = messagesResponse.data[0];
              const processedContent = await processMessageContent(
                lastMessage.content
              );

              if (processedContent) {
                return {
                  answer: extractTextFromMessage(processedContent),
                  conversationId: activeThreadId,
                };
              }
            }
            return {
              answer: "I couldn't generate a response at this time.",
              conversationId: activeThreadId,
            };
          } else {
            return {
              answer: `Sorry, the assistant run failed with status: ${runStatus}`,
              conversationId: activeThreadId,
              error: true,
            };
          }
        } catch (threadError) {
          console.error("Error running assistant:", threadError);
          return {
            answer:
              "Sorry, there was an error running the assistant: " +
              threadError.message,
            conversationId: activeThreadId,
            error: true,
          };
        }
      } catch (err) {
        console.error(`Error running assistant: ${err.message}`);
        setError(`Error running assistant: ${err.message}`);
        return {
          answer:
            "Sorry, I encountered an error running the assistant: " + err.message,
          conversationId: currentThreadId || threadId,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [client, assistantId, threadId, processMessageContent]
  );

  const getThreadMessages = useCallback(
    async (currentThreadId = null) => {
      if (!client) return [];

      setIsLoading(true);
      setError(null);

      try {
        let activeThreadId = currentThreadId || threadId;

        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        if (!activeThreadId) {
          const newThread = await createThread();
          activeThreadId = newThread.id;
        }

        const messagesResponse = await client.beta.threads.messages.list(
          activeThreadId
        );

        const processedMessages = [];
        for (const message of messagesResponse.data) {
          const processedContent = await processMessageContent(message.content);
          processedMessages.push({
            ...message,
            content: processedContent,
          });
        }

        return processedMessages;
      } catch (err) {
        console.error(`Error getting thread messages: ${err.message}`);
        setError(`Error getting thread messages: ${err.message}`);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [client, threadId, processMessageContent]
  );

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

  const handleToolCalls = useCallback(
    async (threadId, runId) => {
      try {
        // Retrieve the current run
        let run = await client.beta.threads.runs.retrieve(threadId, runId);

        // If there are no required actions, return null
        if (
          !run.required_action ||
          run.required_action.type !== "submit_tool_outputs"
        ) {
          return null;
        }

        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        const toolResults = [];

        for (const call of toolCalls) {
          // Process tool calls
          const functionName = call.function.name;
          const functionArgs = JSON.parse(call.function.arguments);

          // Create specialized assistant based on the function call
          const specializedAssistantId = functionName.includes("forecast")
            ? FORECAST_ASSISTANT_ID
            : functionName.includes("sales")
            ? SALES_ASSISTANT_ID
            : null;

          if (!specializedAssistantId) {
            toolResults.push({
              tool_call_id: call.id,
              output: "Error: Unknown specialized assistant type.",
            });
            continue;
          }

          // Create a new thread for the specialized assistant
          const subThread = await client.beta.threads.create();

          // Send the message to the specialized assistant
          await client.beta.threads.messages.create(subThread.id, {
            role: "user",
            content: functionArgs.prompt || "Please provide information.",
          });

          // Run the specialized assistant
          const subRun = await client.beta.threads.runs.create(subThread.id, {
            assistant_id: specializedAssistantId,
          });

          // Wait for the specialized run to complete
          let currentSubRun = subRun;
          let subRunStatus = currentSubRun.status;

          while (["queued", "in_progress"].includes(subRunStatus)) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            currentSubRun = await client.beta.threads.runs.retrieve(
              subThread.id,
              currentSubRun.id
            );
            subRunStatus = currentSubRun.status;
          }

          if (subRunStatus === "completed") {
            const messagesResponse = await client.beta.threads.messages.list(
              subThread.id,
              { order: "desc", limit: 1 }
            );

            if (messagesResponse.data.length > 0) {
              const lastMessage = messagesResponse.data[0];
              const answer = extractTextFromMessage(lastMessage.content);

              toolResults.push({
                tool_call_id: call.id,
                output: answer,
              });
            } else {
              toolResults.push({
                tool_call_id: call.id,
                output: "No response received from specialized assistant.",
              });
            }
          } else {
            toolResults.push({
              tool_call_id: call.id,
              output: `Specialized assistant failed with status: ${subRunStatus}`,
            });
          }
        }

        // Submit tool outputs back to the coordinator
        if (toolResults.length > 0) {
          await client.beta.threads.runs.submitToolOutputs(threadId, runId, {
            tool_outputs: toolResults,
          });
        }

        return null;
      } catch (error) {
        console.error("Error handling tool calls:", error);
        return null;
      }
    },
    [client, extractTextFromMessage]
  );

  const waitForRunCompletion = useCallback(
    async (threadId, runId) => {
      let run = await client.beta.threads.runs.retrieve(threadId, runId);

      while (true) {
        if (run.status === "completed") {
          return run;
        } else if (run.status === "requires_action") {
          await handleToolCalls(threadId, runId);
          // Re-fetch the run after handling tool calls
          run = await client.beta.threads.runs.retrieve(threadId, runId);
        } else if (
          run.status === "failed" ||
          run.status === "cancelled" ||
          run.status === "expired"
        ) {
          throw new Error(`Run failed with status: ${run.status}`);
        } else {
          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          run = await client.beta.threads.runs.retrieve(threadId, runId);
        }
      }
    },
    [client, handleToolCalls]
  );

  const handleSpecializedAssistantRouting = useCallback(
    async (threadId, originalMessage, assistantType) => {
      setIsLoading(true);

      // Determine which assistant ID to use
      const specializedAssistantId =
        assistantType === "Forecast"
          ? FORECAST_ASSISTANT_ID
          : assistantType === "Sales"
          ? SALES_ASSISTANT_ID
          : null;

      if (!specializedAssistantId) {
        console.error("Invalid assistant type for routing");
        return {
          answer: `Unable to route to ${assistantType} assistant - unknown type`,
          error: true,
        };
      }

      try {
        // Add a system message explaining the context switch
        await client.beta.threads.messages.create(threadId, {
          role: "user",
          content: `Please respond as the ${assistantType} Assistant to this query: ${originalMessage}`,
        });

        // Run the specialized assistant
        const run = await client.beta.threads.runs.create(threadId, {
          assistant_id: specializedAssistantId,
        });

        // Monitor the run until completion
        let currentRun = run;
        let runStatus = currentRun.status;

        while (["queued", "in_progress"].includes(runStatus)) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          currentRun = await client.beta.threads.runs.retrieve(
            threadId,
            currentRun.id
          );
          runStatus = currentRun.status;
        }

        if (runStatus === "completed") {
          const messagesResponse = await client.beta.threads.messages.list(
            threadId,
            { order: "desc", limit: 1 }
          );

          if (messagesResponse.data.length > 0) {
            const lastMessage = messagesResponse.data[0];
            const answer = extractTextFromMessage(lastMessage.content);

            return {
              answer,
              assistantName: assistantType,
              error: false,
            };
          }
        }

        throw new Error(`${assistantType} run failed with status: ${runStatus}`);
      } catch (error) {
        console.error(`Error routing to ${assistantType} assistant:`, error);
        return {
          answer: `Sorry, there was an error getting a response from the ${assistantType} Assistant: ${error.message}`,
          error: true,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [client, extractTextFromMessage]
  );

  const conversationHandler = useCallback(
    async (message, conversationId = null, assistantId = null) => {
      setIsLoading(true);
      setError(null);

      try {
        let formattedConversationId = conversationId;
        if (
          formattedConversationId &&
          !formattedConversationId.startsWith("thread_")
        ) {
          formattedConversationId = `thread_${formattedConversationId}`;
        }

        let useThreadId = formattedConversationId || threadId;
        let createNewThread = false;

        if (!useThreadId) {
          createNewThread = true;
        }

        if (formattedConversationId && !createNewThread) {
          // Validate the thread exists
          try {
            await client.beta.threads.retrieve(formattedConversationId);
          } catch (error) {
            console.error("Thread not found, creating new one:", error);
            createNewThread = true;
          }
        }

        if (createNewThread) {
          const newThread = await createThread();
          useThreadId = newThread.id;
        }

        // Always use the coordinator assistant initially
        const coordinatorAssistantId = COORDINATOR_ASSISTANT_ID;

        // Send message to the coordinator assistant
        const messageResult = await sendMessage(message, useThreadId);
        if (!messageResult) {
          throw new Error("Failed to send message");
        }

        // Create a run with the coordinator assistant
        const run = await client.beta.threads.runs.create(useThreadId, {
          assistant_id: coordinatorAssistantId,
        });

        // Wait for the run to complete, handling any tool calls
        await waitForRunCompletion(useThreadId, run.id);

        // Get all messages from the thread
        const messagesResponse = await client.beta.threads.messages.list(
          useThreadId
        );

        // Find the last assistant message
        const assistantMessages = messagesResponse.data.filter(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessages.length === 0) {
          throw new Error("No assistant messages found");
        }

        const lastMessage = assistantMessages[0];
        const rawAnswerText = extractTextFromMessage(lastMessage.content);
        let answerText = rawAnswerText;
        let assistantName = "Coordinator";
        let routedFrom = null;

        // Try to parse if this is a JSON response with metadata
        try {
          const jsonMatch = answerText.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            const jsonData = JSON.parse(jsonMatch[1]);
            if (jsonData.response) {
              answerText = jsonData.response;
            }
            if (jsonData.assistant) {
              assistantName = jsonData.assistant;
            }
            if (jsonData.routed_from) {
              routedFrom = jsonData.routed_from;
            }
          }
        } catch (e) {
          // If parsing fails, use the raw text
          console.error("Error parsing JSON in response:", e);
        }

        // Set the current assistant name
        setCurrentAssistantName(assistantName);

        return {
          answer: answerText,
          conversationId: useThreadId,
          assistantName: assistantName,
          routedFrom: routedFrom,
        };
      } catch (err) {
        console.error("Error in conversation handler:", err);
        setError("Error in conversation handler: " + err.message);
        return {
          answer:
            "Sorry, I encountered an error processing your request: " + err.message,
          conversationId: threadId,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [
      client,
      threadId,
      assistantId,
      createThread,
      sendMessage,
      waitForRunCompletion,
      extractTextFromMessage,
      handleSpecializedAssistantRouting,
    ]
  );

  return {
    client,
    assistantId,
    currentAssistantName,
    threadId,
    messages,
    isLoading,
    error,
    createThread,
    sendMessage,
    runAssistant,
    getThreadMessages,
    conversationHandler,
    handleSpecializedAssistantRouting,
    setThreadId,
  };
};

export default useAzureOpenAI;
