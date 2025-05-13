// Azure OpenAI Service using functional approach
import { useState, useCallback, useEffect } from "react";
import { AzureOpenAI } from "openai";
import { fetchImageFromOpenAI } from "./ImageService";

/**
 * Custom hook for Azure OpenAI Assistant API
 * @returns {Object} Azure OpenAI service methods and state
 */
const useAzureOpenAI = () => {
  const [client, setClient] = useState(null);
  const [assistantId, setAssistantId] = useState(
    process.env.REACT_APP_AI_ASSISTANT_ID
  );
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

  /**
   * Create a new thread
   */
  const createThread = useCallback(async () => {
    if (!client) return null;

    setIsLoading(true);
    setError(null);

    try {
      const thread = await client.beta.threads.create({});

      // Ensure thread ID is properly formatted
      // If the ID doesn't start with 'thread_', add the prefix
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
        let activeThreadId = currentThreadId || threadId;

        // Format thread ID if needed
        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        // Create a thread if none exists
        let useThreadId = activeThreadId;
        if (!useThreadId) {
          const thread = await createThread();
          if (!thread) throw new Error("Failed to create thread");
          useThreadId = thread.id;
        }

        try {
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
        } catch (threadError) {
          // If thread not found, create a new one and retry
          if (
            threadError.message &&
            threadError.message.includes("No thread found with id")
          ) {
            console.log("Thread not found, creating a new one and retrying...");
            const newThread = await createThread();
            if (!newThread) throw new Error("Failed to create new thread");

            // Try again with the new thread
            const messageResponse = await client.beta.threads.messages.create(
              newThread.id,
              {
                role: "user",
                content: message,
              }
            );

            // Update messages state with new thread id
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
            // Rethrow if it's not a "thread not found" error
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

  /**
   * Process message content to handle images and other content types
   * @param {Array} content - Message content items
   */
  const processMessageContent = useCallback(async (content) => {
    if (!content || !Array.isArray(content)) return content;

    // Create a new array of content with processed items
    const processedContent = [...content];

    // Process each content item
    for (let i = 0; i < processedContent.length; i++) {
      const item = processedContent[i];

      // Handle image files
      if (item.type === "image_file" && item.image_file && item.image_file.file_id) {
        try {
          // Fetch image URL
          const imageUrl = await fetchImageFromOpenAI(item.image_file.file_id);
          // Add the URL to the item
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

        // Use provided threadId or the instance threadId
        let activeThreadId = currentThreadId || threadId;

        // Format thread ID if needed
        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        if (!activeThreadId) {
          throw new Error("No thread ID provided or available");
        }

        try {
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

              // Process message content for images and other types
              const processedContent = await processMessageContent(
                latestMessage.content
              );

              // Check for different content types
              let isImage = false;
              let imageUrl = null;
              let imageFileId = null;
              let textContent = "";

              // Extract content based on type
              if (Array.isArray(processedContent)) {
                // Look for image content first
                const imageItem = processedContent.find(
                  (item) => item.type === "image_file"
                );
                if (imageItem && imageItem.image_file) {
                  isImage = true;
                  imageFileId = imageItem.image_file.file_id;
                  imageUrl = imageItem.image_file.url;
                }

                // Get text content as well (might be in a separate item)
                const textItems = processedContent
                  .filter((item) => item.type === "text")
                  .map((item) => item.text?.value || "")
                  .join("\n");

                textContent = textItems;
              }

              // Update messages state
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
          // If thread not found, return an error that the conversation handler can use to create a new thread
          if (
            threadError.message &&
            threadError.message.includes("No thread found with id")
          ) {
            console.log(`Thread not found in runAssistant: ${threadError.message}`);
            throw new Error(`Thread not found: ${activeThreadId}`);
          } else {
            // Rethrow other errors
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

  /**
   * Get messages from a thread with processed image content
   */
  const getThreadMessages = useCallback(
    async (currentThreadId = null) => {
      if (!client) return [];

      setIsLoading(true);
      setError(null);

      try {
        let activeThreadId = currentThreadId || threadId;

        // Format thread ID if needed
        if (activeThreadId && !activeThreadId.startsWith("thread_")) {
          activeThreadId = `thread_${activeThreadId}`;
        }

        if (!activeThreadId) {
          throw new Error("No thread ID provided or available");
        }

        const messagesResponse = await client.beta.threads.messages.list(
          activeThreadId
        );

        // Process each message to handle images
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

  /**
   * Handle a complete conversation flow
   */
  const conversationHandler = useCallback(
    async (message, conversationId = null) => {
      setIsLoading(true);
      setError(null);

      try {
        // Format the conversation ID if needed
        let formattedConversationId = conversationId;
        if (
          formattedConversationId &&
          !formattedConversationId.startsWith("thread_")
        ) {
          formattedConversationId = `thread_${formattedConversationId}`;
        }

        let useThreadId = formattedConversationId || threadId;
        let createNewThread = false;

        // If no thread ID yet, create one
        if (!useThreadId) {
          createNewThread = true;
        }

        // If conversationId is provided, use it as threadId (after validating it exists)
        if (formattedConversationId && !createNewThread) {
          try {
            // Try to list messages to check if thread exists
            await client.beta.threads.messages.list(formattedConversationId);
            // If successful, set as thread ID
            setThreadId(formattedConversationId);
            useThreadId = formattedConversationId;
          } catch (threadError) {
            console.log(
              `Thread not found: ${threadError.message}, creating new thread`
            );
            createNewThread = true;
          }
        }

        // Create a new thread if needed or if previous thread wasn't found
        if (createNewThread) {
          const thread = await createThread();
          if (!thread) throw new Error("Failed to create thread");
          useThreadId = thread.id;
          setThreadId(useThreadId);
        }

        // Send message to the validated thread
        const messageResult = await sendMessage(message, useThreadId);
        if (!messageResult) {
          throw new Error("Failed to send message");
        }

        // Run the assistant and get response
        const response = await runAssistant(assistantId, useThreadId);
        return {
          ...response,
          conversationId: useThreadId,
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
    [client, threadId, assistantId, createThread, sendMessage, runAssistant]
  );

  return {
    client,
    assistantId,
    threadId,
    messages,
    isLoading,
    error,
    createThread,
    sendMessage,
    runAssistant,
    getThreadMessages,
    conversationHandler,
    setThreadId,
  };
};

export default useAzureOpenAI;
