// Azure OpenAI Service using functional approach
import { useState, useCallback, useEffect } from "react";
import { AzureOpenAI } from "openai";

/**
 * Custom hook for Azure OpenAI Assistant API
 * @returns {Object} Azure OpenAI service methods and state
 */
const useAzureOpenAI = () => {
  const [client, setClient] = useState(null);
  const [assistantId, setAssistantId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialize the client
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

  /**
   * Set up a new assistant
   */
  const setupAssistant = useCallback(
    async (customInstructions = "") => {
      if (!client) return null;

      setIsLoading(true);
      setError(null);

      try {
        const options = {
          model: "gpt-4o", // replace with your deployed model name
          name: "TestAssistant",
          instructions:
            customInstructions ||
            "You are a helpful assistant designed to provide insights on sales data, forecasts, and market trends.",
          tools: [],
          tool_resources: {},
          temperature: 0.7,
          top_p: 0.95,
        };

        const assistantResponse = await client.beta.assistants.create(options);
        console.log(`Assistant created with ID: ${assistantResponse.id}`);
        setAssistantId(assistantResponse.id);

        return assistantResponse;
      } catch (err) {
        console.error(`Error creating assistant: ${err.message}`);
        setError(`Error creating assistant: ${err.message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  /**
   * Create a new thread
   */
  const createThread = useCallback(async () => {
    if (!client) return null;

    setIsLoading(true);
    setError(null);

    try {
      const thread = await client.beta.threads.create({});
      console.log(`Thread created with ID: ${thread.id}`);
      setThreadId(thread.id);

      return thread;
    } catch (err) {
      console.error(`Error creating thread: ${err.message}`);
      setError(`Error creating thread: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  /**
   * Send a message to a thread
   */
  const sendMessage = useCallback(
    async (message, currentThreadId = null) => {
      if (!client) return null;

      setIsLoading(true);
      setError(null);

      try {
        // Use provided threadId or the instance threadId
        const activeThreadId = currentThreadId || threadId;

        // Create a thread if none exists
        let useThreadId = activeThreadId;
        if (!useThreadId) {
          const thread = await createThread();
          if (!thread) throw new Error("Failed to create thread");
          useThreadId = thread.id;
        }

        // Add message to thread
        const messageResponse = await client.beta.threads.messages.create(
          useThreadId,
          {
            role: "user",
            content: message,
          }
        );

        // Update messages state
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

  /**
   * Run the assistant on a thread
   */
  const runAssistant = useCallback(
    async (currentAssistantId = null, currentThreadId = null) => {
      if (!client) return null;

      setIsLoading(true);
      setError(null);

      try {
        // Use provided assistantId or the instance assistantId
        let activeAssistantId = currentAssistantId || assistantId;

        // Create assistant if none exists
        if (!activeAssistantId) {
          const assistant = await setupAssistant();
          if (!assistant) throw new Error("Failed to create assistant");
          activeAssistantId = assistant.id;
        }

        // Use provided threadId or the instance threadId
        const activeThreadId = currentThreadId || threadId;
        if (!activeThreadId) {
          throw new Error("No thread ID provided or available");
        }

        // Run the thread
        const runResponse = await client.beta.threads.runs.create(activeThreadId, {
          assistant_id: activeAssistantId,
        });

        // Poll for completion
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

        // Get messages after completion
        if (runStatus === "completed") {
          const messagesResponse = await client.beta.threads.messages.list(
            activeThreadId
          );

          // Find the latest assistant message
          const assistantMessages = messagesResponse.data.filter(
            (msg) => msg.role === "assistant"
          );
          if (assistantMessages.length > 0) {
            const latestMessage = assistantMessages[0];
            const answer = latestMessage.content[0].text.value;

            // Update messages state
            setMessages((prev) => [
              ...prev,
              {
                id: latestMessage.id,
                role: "assistant",
                content: answer,
                threadId: activeThreadId,
                timestamp: new Date(),
              },
            ]);

            return {
              answer,
              conversationId: activeThreadId,
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
    [client, assistantId, threadId, setupAssistant]
  );

  /**
   * Get messages from a thread
   */
  const getThreadMessages = useCallback(
    async (currentThreadId = null) => {
      if (!client) return [];

      setIsLoading(true);
      setError(null);

      try {
        const activeThreadId = currentThreadId || threadId;
        if (!activeThreadId) {
          throw new Error("No thread ID provided or available");
        }

        const messagesResponse = await client.beta.threads.messages.list(
          activeThreadId
        );
        return messagesResponse.data;
      } catch (err) {
        console.error(`Error getting thread messages: ${err.message}`);
        setError(`Error getting thread messages: ${err.message}`);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [client, threadId]
  );

  /**
   * Handle a complete conversation flow
   */
  const conversationHandler = useCallback(
    async (message, conversationId = null) => {
      setIsLoading(true);
      setError(null);

      try {
        // If conversationId is provided, use it as threadId
        if (conversationId) {
          setThreadId(conversationId);
        } else if (!threadId) {
          // Create new thread if none exists
          await createThread();
        }

        // Create assistant if not already created
        if (!assistantId) {
          await setupAssistant();
        }

        // Send message
        const messageResult = await sendMessage(message, conversationId || threadId);
        if (!messageResult) {
          throw new Error("Failed to send message");
        }

        // Run the assistant and get response
        const response = await runAssistant(assistantId, conversationId || threadId);
        return response;
      } catch (err) {
        console.error("Error in conversation handler:", err);
        setError("Error in conversation handler: " + err.message);
        return {
          answer: "Sorry, I encountered an error processing your request.",
          conversationId: conversationId || threadId,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [threadId, assistantId, createThread, setupAssistant, sendMessage, runAssistant]
  );

  return {
    client,
    assistantId,
    threadId,
    messages,
    isLoading,
    error,
    setupAssistant,
    createThread,
    sendMessage,
    runAssistant,
    getThreadMessages,
    conversationHandler,
    setThreadId,
  };
};

export default useAzureOpenAI;
