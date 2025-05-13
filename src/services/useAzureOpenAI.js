import { useState, useCallback, useEffect } from "react";
import { AzureOpenAI } from "openai";
import { fetchImageFromOpenAI } from "./ImageService";

const useAzureOpenAI = () => {
  const [client, setClient] = useState(null);
  const [assistantId, setAssistantId] = useState(
    process.env.REACT_APP_AI_ASSISTANT_ID
  );
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

  const conversationHandler = useCallback(
    async (message, conversationId = null) => {
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

        const messageResult = await sendMessage(message, useThreadId);
        if (!messageResult) {
          throw new Error("Failed to send message");
        }

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
