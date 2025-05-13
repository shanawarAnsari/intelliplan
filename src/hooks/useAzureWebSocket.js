import { useState, useEffect, useCallback, useRef } from "react";

const useAzureWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const messageHandlersRef = useRef(new Map());

  const connect = useCallback(() => {
    try {
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setError(null);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
        attemptReconnect();
      };

      socketRef.current.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Error with WebSocket connection");
      };

      socketRef.current.onmessage = (event) => {
        handleMessage(event);
      };
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      setError(`Error creating WebSocket connection: ${err.message}`);
    }
  }, [url]);
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);

      const messageType = data.type || "default";

      if (messageHandlersRef.current.has(messageType)) {
        const handlers = messageHandlersRef.current.get(messageType);
        handlers.forEach((handler) => handler(data));
      }
    } catch (err) {
      console.error("Error handling WebSocket message:", err);
    }
  }, []);
  const on = useCallback((messageType, handler) => {
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, []);
    }

    messageHandlersRef.current.get(messageType).push(handler);

    // Return function to unregister handler
    return () => {
      const handlers = messageHandlersRef.current.get(messageType);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      console.log(
        `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
      );

      setTimeout(() => {
        connect();
      }, reconnectDelay);
    } else {
      setError("Maximum reconnection attempts reached");
    }
  }, [connect]);
  const send = useCallback((message) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return false;
    }

    try {
      const messageString =
        typeof message === "string" ? message : JSON.stringify(message);

      socketRef.current.send(messageString);
      return true;
    } catch (err) {
      console.error("Error sending WebSocket message:", err);
      return false;
    }
  }, []);
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      setIsConnected(false);
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, url]);

  return {
    isConnected,
    error,
    messages,
    send,
    disconnect,
    connect,
    on,
  };
};

export default useAzureWebSocket;
