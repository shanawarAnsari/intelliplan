import { useCallback } from "react";
import useAzureOpenAI from "../services/useAzureOpenAI";

/**
 * Custom hook to validate thread IDs and handle thread recreation
 */
const useThreadValidator = () => {
  const { client } = useAzureOpenAI();

  /**
   * Validate that a thread exists and is accessible
   * @param {string} threadId - The thread ID to validate
   * @returns {Promise<boolean>} - True if valid, false if not
   */
  const validateThread = useCallback(
    async (threadId) => {
      if (!client || !threadId) return false;

      // Ensure thread ID has proper format
      const formattedThreadId = threadId.startsWith("thread_")
        ? threadId
        : `thread_${threadId}`;

      try {
        // Attempt to list messages to see if thread is accessible
        await client.beta.threads.messages.list(formattedThreadId);
        return true;
      } catch (error) {
        console.error(`Thread validation failed: ${error.message}`);
        return false;
      }
    },
    [client]
  );

  /**
   * Safely format a thread ID with 'thread_' prefix
   * @param {string} id - The ID to format
   * @returns {string} - The formatted ID
   */
  const formatThreadId = useCallback((id) => {
    if (!id) return null;
    return id.startsWith("thread_") ? id : `thread_${id}`;
  }, []);

  return {
    validateThread,
    formatThreadId,
  };
};

export default useThreadValidator;
