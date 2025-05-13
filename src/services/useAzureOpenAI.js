import { useState, useCallback, useEffect } from "react";
import { AzureOpenAI } from "openai";
import { fetchImageFromOpenAI } from "./ImageService";
import {
  COORDINATOR_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
} from "../utils/assistantConstants";

const useAzureOpenAI = () => {
  const [client, setClient] = useState(null);
  const [assistantId, setAssistantId] = useState(COORDINATOR_ASSISTANT_ID);
  const [currentAssistantName, setCurrentAssistantName] = useState("Coordinator");
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const initializeClient = () => {
      try {
        const azureOpenAIKey = process.env.REACT_APP_AZURE_OPENAI_KEY;
        const azureOpenAIEndpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
        const azureOpenAIVersion = "2024-05-01-preview";

        if (!azureOpenAIKey || !azureOpenAIEndpoint) {
          console.error(
            "Azure OpenAI credentials are not set in environment variables."
          );
          setError("Azure OpenAI credentials are not set in environment variables.");
          return;
        }

        const openAIClient = new AzureOpenAI({
          endpoint: azureOpenAIEndpoint,
          apiVersion: azureOpenAIVersion,
          apiKey: azureOpenAIKey,
          dangerouslyAllowBrowser: true,
        });

        console.log("Azure OpenAI client initialized");
        setClient(openAIClient);
      } catch (err) {
        console.error("Error initializing Azure OpenAI client:", err);
        setError("Error initializing Azure OpenAI client: " + err.message);
      }
    };

    initializeClient();
  }, []);

  const createThread = useCallback(async () => {
    if (!client) return null;

    setIsLoading(true);
    setError(null);

    try {
      const thread = await client.beta.threads.create({});

      const formattedThreadId = thread.id.startsWith("thread_")
        ? thread.id
        : `thread_${thread.id}`;

      console.log(`Thread created with ID: ${formattedThreadId}`);
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
          const thread = await createThread();
          if (!thread) throw new Error("Failed to create thread");
          useThreadId = thread.id;
        }

        try {
          const messageResponse = await client.beta.threads.messages.create(
            useThreadId,
            {
              role: "user",
              content: message,
            }
          );

          setMessages((prev) => [
            ...prev,
            {
              id: messageResponse.id,
              role: "user",
              content: message,
              threadId: useThreadId,
              timestamp: new Date(),
            },
          ]);

          return messageResponse;
        } catch (threadError) {
          if (
            threadError.message &&
            threadError.message.includes("No thread found with id")
          ) {
            console.log("Thread not found, creating a new one and retrying...");
            const newThread = await createThread();
            if (!newThread) throw new Error("Failed to create new thread");

            const messageResponse = await client.beta.threads.messages.create(
              newThread.id,
              {
                role: "user",
                content: message,
              }
            );

            setMessages((prev) => [
              ...prev,
              {
                id: messageResponse.id,
                role: "user",
                content: message,
                threadId: newThread.id,
                timestamp: new Date(),
              },
            ]);

            return messageResponse;
          } else {
            throw threadError;
          }
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
        try {
          console.log("Processing image file:", item.image_file.file_id);
          const imageUrl = await fetchImageFromOpenAI(item.image_file.file_id);
          console.log("Image URL obtained:", imageUrl);
          processedContent[i] = {
            ...item,
            image_file: {
              ...item.image_file,
              url: imageUrl,
            },
          };
        } catch (error) {
          console.error(
            `Failed to process image ${item.image_file.file_id}:`,
            error
          );
        }
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
          throw new Error("No thread ID provided or available");
        }

        try {
          const runResponse = await client.beta.threads.runs.create(activeThreadId, {
            assistant_id: activeAssistantId,
          });

          let runStatus = runResponse.status;
          while (runStatus === "queued" || runStatus === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const runStatusResponse = await client.beta.threads.runs.retrieve(
              activeThreadId,
              runResponse.id
            );
            runStatus = runStatusResponse.status;
            console.log(`Current run status: ${runStatus}`);
          }

          if (runStatus === "completed") {
            const messagesResponse = await client.beta.threads.messages.list(
              activeThreadId
            );

            const assistantMessages = messagesResponse.data.filter(
              (msg) => msg.role === "assistant"
            );

            if (assistantMessages.length > 0) {
              const latestMessage = assistantMessages[0];

              const processedContent = await processMessageContent(
                latestMessage.content
              );

              let isImage = false;
              let imageUrl = null;
              let imageFileId = null;
              let textContent = "";

              if (Array.isArray(processedContent)) {
                const imageItem = processedContent.find(
                  (item) => item.type === "image_file"
                );
                if (imageItem && imageItem.image_file) {
                  isImage = true;
                  imageFileId = imageItem.image_file.file_id;
                  imageUrl = imageItem.image_file.url;
                }

                const textItems = processedContent
                  .filter((item) => item.type === "text")
                  .map((item) => item.text?.value || "")
                  .join("\n");

                textContent = textItems;
              }

              setMessages((prev) => [
                ...prev,
                {
                  id: latestMessage.id,
                  role: "assistant",
                  content: textContent,
                  threadId: activeThreadId,
                  timestamp: new Date(),
                  isImage,
                  imageUrl,
                  imageFileId,
                },
              ]);

              return {
                answer: textContent,
                conversationId: activeThreadId,
                isImage,
                imageUrl,
                imageFileId,
              };
            } else {
              return {
                answer: "No response from assistant",
                conversationId: activeThreadId,
              };
            }
          } else {
            console.log(`Run status is ${runStatus}, unable to fetch messages.`);
            return {
              answer: `The assistant encountered an issue. Status: ${runStatus}`,
              conversationId: activeThreadId,
            };
          }
        } catch (threadError) {
          if (
            threadError.message &&
            threadError.message.includes("No thread found with id")
          ) {
            console.log(`Thread not found in runAssistant: ${threadError.message}`);
            throw new Error(`Thread not found: ${activeThreadId}`);
          } else {
            throw threadError;
          }
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
          throw new Error("No thread ID provided or available");
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
        console.log(`Checking for tool calls on run ${runId} in thread ${threadId}`);

        // Retrieve the current run
        let run = await client.beta.threads.runs.retrieve(threadId, runId);

        // If there are no required actions, return null
        if (
          !run.required_action ||
          run.required_action.type !== "submit_tool_outputs"
        ) {
          return null;
        }

        console.log("Tool outputs required from coordinator assistant");
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        const toolResults = [];

        for (const call of toolCalls) {
          const functionName = call.function.name;
          const args = JSON.parse(call.function.arguments);
          console.log(`Handling tool call: ${functionName} with args:`, args);

          let assistantId, assistantName;

          // Determine which assistant to use based on function name
          if (functionName === "route_to_sales") {
            assistantId = SALES_ASSISTANT_ID; // SalesAssistant
            assistantName = "Sales";
          } else if (functionName === "route_to_forecast") {
            assistantId = FORECAST_ASSISTANT_ID; // ForecastAssistant
            assistantName = "Forecast";
          } else {
            console.warn(`Unknown function: ${functionName}`);
            continue;
          }

          console.log(`Routing to ${assistantName} Assistant`);

          // Create a new thread for the specialized assistant
          const subThread = await client.beta.threads.create();
          console.log(`Created sub-thread: ${subThread.id}`); // Send the prompt to the specialized assistant
          await client.beta.threads.messages.create(subThread.id, {
            role: "user",
            content:
              args.prompt ||
              args.query ||
              args.message ||
              "Please analyze this request",
          });

          // Run the specialized assistant
          let subRun = await client.beta.threads.runs.create(subThread.id, {
            assistant_id: assistantId,
          });

          // Wait for the specialized assistant to complete
          while (["queued", "in_progress"].includes(subRun.status)) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            subRun = await client.beta.threads.runs.retrieve(
              subThread.id,
              subRun.id
            );
            console.log(`Specialized assistant status: ${subRun.status}`);
          }

          // Get the response from the specialized assistant
          if (subRun.status === "completed") {
            const messagesResponse = await client.beta.threads.messages.list(
              subThread.id,
              { order: "asc" }
            );
            const lastMessage = messagesResponse.data.find(
              (msg) => msg.role === "assistant"
            );

            if (lastMessage) {
              const output = extractTextFromMessage(lastMessage.content);
              console.log(`${assistantName} Assistant response:`, output);

              // Add metadata to indicate which assistant provided this answer
              const outputWithMetadata = {
                content: output,
                assistantName: assistantName,
                source: "specialized_assistant",
              };

              toolResults.push({
                tool_call_id: call.id,
                output: JSON.stringify(outputWithMetadata),
              });
            }
          } else {
            console.error(
              `Specialized assistant failed with status: ${subRun.status}`
            );
            toolResults.push({
              tool_call_id: call.id,
              output: `Error: ${subRun.status}`,
            });
          }
        }

        // Submit tool outputs back to the coordinator
        if (toolResults.length > 0) {
          console.log(
            `Submitting ${toolResults.length} tool outputs back to coordinator`
          );
          const submitResponse = await client.beta.threads.runs.submitToolOutputs(
            threadId,
            runId,
            { tool_outputs: toolResults }
          );
          return submitResponse.id;
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
        console.log(`Run status: ${run.status}`);

        if (run.status === "completed") {
          return run;
        } else if (run.status === "requires_action") {
          // Handle tool calls and get a new run ID if available
          const newRunId = await handleToolCalls(threadId, runId);

          if (newRunId) {
            // If we got a new run ID, start monitoring that one
            runId = newRunId;
            console.log(
              `Switching to monitor new run ID after tool submission: ${runId}`
            );
          }
        } else if (["failed", "cancelled", "expired"].includes(run.status)) {
          console.error(`Run ended with status: ${run.status}`);
          throw new Error(`Assistant run failed with status: ${run.status}`);
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        run = await client.beta.threads.runs.retrieve(threadId, runId);
      }
    },
    [client, handleToolCalls]
  );
  const handleSpecializedAssistantRouting = useCallback(
    async (threadId, originalMessage, assistantType) => {
      console.log(
        `Explicitly routing to ${assistantType} assistant with message:`,
        originalMessage
      );
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

        console.log(`Created run for ${assistantType} assistant with ID: ${run.id}`);

        // Monitor the run until completion
        let currentRun = run;
        let runStatus = currentRun.status;

        while (["queued", "in_progress"].includes(runStatus)) {
          console.log(`${assistantType} run status: ${runStatus}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          currentRun = await client.beta.threads.runs.retrieve(
            threadId,
            currentRun.id
          );
          runStatus = currentRun.status;
        }

        if (runStatus === "completed") {
          // Get the latest message
          const messages = await client.beta.threads.messages.list(threadId);
          const latestMessage = messages.data.find(
            (msg) => msg.role === "assistant"
          );

          if (latestMessage) {
            const responseText = extractTextFromMessage(latestMessage.content);
            console.log(`Response from ${assistantType} assistant:`, responseText);

            return {
              answer: responseText,
              assistantName: assistantType,
              routedFrom: "Coordinator",
              success: true,
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
      }
    },
    [client, extractTextFromMessage]
  );
  const conversationHandler = useCallback(
    async (message, conversationId = null, assistantId = null) => {
      setIsLoading(true);
      setError(null);

      // Log that we're starting a new conversation
      console.log("Starting conversation handler with message:", message);
      console.log("Using thread ID:", conversationId || "none (will create new)");

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
          try {
            await client.beta.threads.messages.list(formattedConversationId);
            setThreadId(formattedConversationId);
            useThreadId = formattedConversationId;
          } catch (threadError) {
            console.log(
              `Thread not found: ${threadError.message}, creating new thread`
            );
            createNewThread = true;
          }
        }

        if (createNewThread) {
          const thread = await createThread();
          if (!thread) throw new Error("Failed to create thread");
          useThreadId = thread.id;
          setThreadId(useThreadId);
        }

        // Always use the coordinator assistant initially
        const coordinatorAssistantId = COORDINATOR_ASSISTANT_ID;

        // Send message to the coordinator assistant
        const messageResult = await sendMessage(message, useThreadId);
        if (!messageResult) {
          throw new Error("Failed to send message");
        }

        console.log("Message sent to coordinator, creating run...");

        // Create a run with the coordinator assistant
        const run = await client.beta.threads.runs.create(useThreadId, {
          assistant_id: coordinatorAssistantId,
        });

        console.log(`Run created with ID: ${run.id}`);

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
          throw new Error("No response from assistant");
        }

        const lastMessage = assistantMessages[0];
        const rawAnswerText = extractTextFromMessage(lastMessage.content);
        let answerText = rawAnswerText;
        let assistantName = "Coordinator";
        let routedFrom = null;

        console.log("Raw final answer:", rawAnswerText); // Check for text-based routing instructions
        if (
          answerText.includes("Forecast Assistant will process") ||
          answerText.includes("routing to Forecast")
        ) {
          console.log("Detected text-based routing to Forecast Assistant"); // Use the specialized handler directly
          const forecastResponse = await handleSpecializedAssistantRouting(
            useThreadId,
            message,
            "Forecast"
          );

          if (forecastResponse && !forecastResponse.error) {
            answerText = forecastResponse.answer;
            assistantName = "Forecast";
            routedFrom = "Coordinator";
            setCurrentAssistantName("Forecast");

            // Make sure we're actually returning the specialized response
            console.log(
              "Successfully received response from Forecast Assistant:",
              answerText
            );

            // Return immediately with specialized assistant response
            return {
              answer: forecastResponse.answer,
              conversationId: useThreadId,
              assistantName: "Forecast",
              routedFrom: "Coordinator",
            };
          } else {
            console.error(
              "Error getting response from Forecast Assistant:",
              forecastResponse?.answer
            );
          }
        } else if (
          answerText.includes("Sales Assistant will process") ||
          answerText.includes("routing to Sales")
        ) {
          console.log("Detected text-based routing to Sales Assistant"); // Use the specialized handler directly
          const salesResponse = await handleSpecializedAssistantRouting(
            useThreadId,
            message,
            "Sales"
          );

          if (salesResponse && !salesResponse.error) {
            answerText = salesResponse.answer;
            assistantName = "Sales";
            routedFrom = "Coordinator";
            setCurrentAssistantName("Sales");

            console.log(
              "Successfully received response from Sales Assistant:",
              answerText
            );

            // Return immediately with specialized assistant response
            return {
              answer: salesResponse.answer,
              conversationId: useThreadId,
              assistantName: "Sales",
              routedFrom: "Coordinator",
            };
          } else {
            console.error(
              "Error getting response from Sales Assistant:",
              salesResponse?.answer
            );
          }
        }

        // Try to parse if this is a JSON response with metadata
        try {
          const possibleJson = JSON.parse(rawAnswerText);
          if (possibleJson && possibleJson.content && possibleJson.assistantName) {
            answerText = possibleJson.content;
            assistantName = possibleJson.assistantName;
            routedFrom = "Coordinator";
            console.log(
              `Response is from ${assistantName} assistant, routed from Coordinator`
            );
          }
        } catch (e) {
          // Not JSON, just use the raw text from the coordinator
          console.log("Response is directly from Coordinator");
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
