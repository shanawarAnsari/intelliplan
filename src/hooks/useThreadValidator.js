import { useCallback } from "react";
import useAzureOpenAI from "../services/useAzureOpenAI";

const useThreadValidator = () => {
  const { client } = useAzureOpenAI();
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
