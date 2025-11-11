/**
 * Custom hook for scrolling to bottom of message list
 */
import { useEffect, useRef } from "react";

export const useScrollToBottom = (dependencies = []) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, dependencies);

  return messagesEndRef;
};
