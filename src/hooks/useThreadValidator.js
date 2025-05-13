import { useCallback } from "react";
import useAzureOpenAI from "../hooks/useAzureOpenAI";

const useThreadValidator = () => {
  const { client } = useAzureOpenAI();

  const validateThread = useCallback(
    async (threadId) => {
      if (!client || !threadId) return false;

      const formattedThreadId = threadId.startsWith("thread_")
        ? threadId
        : `thread_${threadId}`;

      try {
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
