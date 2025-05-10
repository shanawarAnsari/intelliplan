import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import useAzureOpenAI from "../services/useAzureOpenAI";
import useThreadValidator from "../hooks/useThreadValidator";

// Create context
const ConversationContext = createContext();

/**
 * Provider component for conversation management
 */
export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    conversationHandler,
    setThreadId,
    isLoading: isAILoading,
    error: aiError,
    createThread,
  } = useAzureOpenAI();

  const { validateThread, formatThreadId } = useThreadValidator(); // Initialize by loading saved conversations from localStorage and creating an initial conversation
  useEffect(() => {
    const loadSavedConversations = async () => {
      try {
        // Load any existing conversations from localStorage
        const savedConversations = localStorage.getItem("conversations");
        let parsedConversations = [];

        if (savedConversations) {
          parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
        }

        // Always create a new thread for a new conversation
        const thread = await createThread();
        if (thread) {
          // This will be the active conversation when the app starts
          const newConversation = {
            id: thread.id,
            title: "New Conversation",
            messages: [],
            created: new Date(),
          };

          // Add the new conversation to the list and update localStorage
          const updatedConversations = [newConversation, ...parsedConversations];
          setConversations(updatedConversations);
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );

          setActiveConversation(newConversation);
          setThreadId(thread.id);
        }
      } catch (error) {
        console.error("Error initializing conversations:", error);
      }
    };

    loadSavedConversations();
  }, [createThread, setThreadId]);

  /**
   * Select a conversation by ID
   */
  const selectConversation = useCallback(
    async (conversationId) => {
      try {
        const selected = conversations.find((conv) => conv.id === conversationId);
        if (!selected) return;

        // First check if the thread exists/is valid
        const isValid = await validateThread(selected.id);

        if (isValid) {
          // Thread is valid, use it
          setActiveConversation(selected);
          setThreadId(formatThreadId(selected.id));
        } else {
          // Thread doesn't exist, create a new one
          const thread = await createThread();
          if (thread) {
            // Update conversation with new thread ID
            const updatedConversation = {
              ...selected,
              id: thread.id,
            };

            setActiveConversation(updatedConversation);
            setThreadId(thread.id);

            // Update in the conversations list
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === conversationId ? updatedConversation : conv
              )
            );
          }
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
      }
    },
    [conversations, setThreadId, validateThread, formatThreadId, createThread]
  );
  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(
    async (title) => {
      try {
        // Always create a new thread
        const thread = await createThread();
        const threadId = thread?.id || uuidv4();

        const newConversation = {
          id: threadId,
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };

        // Update conversations in state
        setConversations((prev) => {
          const updatedConversations = [newConversation, ...prev];
          // Save to localStorage
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
          return updatedConversations;
        });

        setActiveConversation(newConversation);
        if (thread) {
          setThreadId(threadId);
        }

        return newConversation;
      } catch (error) {
        console.error("Error creating new conversation:", error);

        // Fallback to UUID if thread creation fails
        const fallbackConversation = {
          id: uuidv4(),
          title: title || `New Conversation`,
          messages: [],
          created: new Date(),
        };

        // Update conversations in state with fallback
        setConversations((prev) => {
          const updatedConversations = [fallbackConversation, ...prev];
          // Save to localStorage
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
          return updatedConversations;
        });

        setActiveConversation(fallbackConversation);

        return fallbackConversation;
      }
    },
    [createThread, setThreadId]
  );
  /**
   * Send a message in the active conversation
   */
  const sendMessage = useCallback(
    async (message) => {
      if (!activeConversation) {
        return null;
      }

      setIsLoading(true);

      try {
        // Add user message to the conversation
        const userMessage = {
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        const updatedMessages = [...activeConversation.messages, userMessage];
        let updatedConversation = {
          ...activeConversation,
          messages: updatedMessages,
        }; // Generate or update title based on the conversation progress
        const shouldGenerateTitle =
          // First message case
          (activeConversation.messages.length === 0 &&
            activeConversation.title === "New Conversation") ||
          // Every 3rd message case (starting from 1st)
          (activeConversation.messages.length > 0 &&
            activeConversation.messages.length % 3 === 0 &&
            activeConversation.messages.filter((msg) => msg.role === "user").length >
              0);

        if (shouldGenerateTitle) {
          try {
            console.log("Generating title for conversation...");
            // Create a new thread to generate a title
            const titleThread = await createThread();
            if (titleThread) {
              // Use all conversation context for better titles after the first message
              const contextPrompt =
                activeConversation.messages.length > 0
                  ? `Here's a conversation so far:\n${activeConversation.messages
                      .map(
                        (m) =>
                          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
                      )
                      .join(
                        "\n"
                      )}\n\nNew message: "${message}"\n\nPlease generate a brief, descriptive title (4-5 words max) that summarizes this conversation.`
                  : `Please generate a brief, descriptive title (4-5 words max) for a conversation that starts with this message: "${message}"`;

              const titleResponse = await conversationHandler(
                contextPrompt,
                titleThread.id
              );

              if (titleResponse && titleResponse.answer) {
                // Clean up the answer to ensure it's just the title
                const generatedTitle = titleResponse.answer
                  .replace(/^["']|["']$/g, "") // Remove quotes if present
                  .trim();

                updatedConversation = {
                  ...updatedConversation,
                  title: generatedTitle,
                };

                console.log("Generated new title:", generatedTitle);
              }
            }
          } catch (titleError) {
            console.error("Error generating title:", titleError);
            // Continue with default title if title generation fails
          }
        } // Update conversations state
        setActiveConversation(updatedConversation);
        setConversations((prev) => {
          const updatedConversations = prev.map((conv) =>
            conv.id === activeConversation.id ? updatedConversation : conv
          );
          // Save to localStorage immediately after updating title
          localStorage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
          return updatedConversations;
        });

        // Send message to Azure OpenAI
        let response;
        try {
          response = await conversationHandler(message, activeConversation.id);
        } catch (error) {
          // If API call failed, might need a new thread
          const thread = await createThread();
          if (thread) {
            // Update conversation with new thread ID
            const reconversation = {
              ...updatedConversation,
              id: thread.id,
            };

            setActiveConversation(reconversation);
            setConversations((prev) => {
              return prev.map((conv) =>
                conv.id === activeConversation.id ? reconversation : conv
              );
            });

            // Try again with new thread
            response = await conversationHandler(message, thread.id);
          } else {
            throw error;
          }
        } // Add assistant message to the conversation
        if (response && response.answer) {
          const assistantMessage = {
            role: "assistant",
            content: response.answer,
            timestamp: new Date(),
          };

          const finalMessages = [...updatedMessages, assistantMessage];
          const finalConversation = {
            ...updatedConversation, // Use updatedConversation to preserve the generated title
            messages: finalMessages,
            // Update ID if response contains a new conversationId
            id: response.conversationId || activeConversation.id,
          };

          setActiveConversation(finalConversation);
          setConversations((prev) => {
            const updatedConversations = prev.map((conv) =>
              conv.id === activeConversation.id ? finalConversation : conv
            );
            // Save updated conversations to localStorage
            localStorage.setItem(
              "conversations",
              JSON.stringify(updatedConversations)
            );
            return updatedConversations;
          });
        }

        return response;
      } catch (error) {
        console.error("Error sending message:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, conversationHandler, createThread, setThreadId]
  );

  const value = {
    conversations,
    activeConversation,
    isLoading: isLoading || isAILoading,
    error: aiError,
    selectConversation,
    createNewConversation,
    sendMessage,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

/**
 * Hook to use the conversation context
 */
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
};

export default ConversationContext;
