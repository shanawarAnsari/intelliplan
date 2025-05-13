import React, { useState, useRef, useEffect } from "react";
import { apiService } from "../services/apiService";
import "./ChatBot.css";

// Assistant IDs
const ASSISTANTS = {
  COORDINATOR: "asst_6VsHLyDwxFQhoxZakELHag4x",
  FORECAST: "asst_fJohmubFJ1rLarIbgKXXVV5c",
  SALES: "asst_gTygyP8mTRID3LvmwWnZcGdj",
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routingInfo, setRoutingInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const routeToAssistant = async (routeFunction, originalQuery) => {
    if (routeFunction === "route_to_forecast") {
      return await apiService.sendMessageToAssistant(
        originalQuery,
        ASSISTANTS.FORECAST
      );
    } else if (routeFunction === "route_to_sales") {
      return await apiService.sendMessageToAssistant(
        originalQuery,
        ASSISTANTS.SALES
      );
    }
    return null;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userMessage = {
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const originalQuery = inputMessage;

    try {
      let threadId = localStorage.getItem("currentThreadId");

      // Create a new thread if one doesn't exist
      if (!threadId) {
        try {
          const threadResponse = await apiService.createThread();
          threadId = threadResponse.threadId;
          localStorage.setItem("currentThreadId", threadId);
          console.log("Created new thread:", threadId);
        } catch (error) {
          console.error("Error creating thread:", error);
        }
      }

      // First, send to coordinator assistant
      const coordinatorResponse = await apiService.sendMessageToAssistant(
        originalQuery,
        ASSISTANTS.COORDINATOR,
        threadId
      );

      // Update thread ID if a new one was created
      if (
        coordinatorResponse.threadId &&
        threadId !== coordinatorResponse.threadId
      ) {
        threadId = coordinatorResponse.threadId;
        localStorage.setItem("currentThreadId", threadId);
      }

      let finalResponse;
      let assistantType = "Coordinator"; // Check if coordinator returned a routing function
      if (coordinatorResponse.routeFunction) {
        // Show routing information to the user
        const routingTarget =
          coordinatorResponse.routeFunction === "route_to_forecast"
            ? "Forecast Assistant"
            : "Sales Assistant";

        setRoutingInfo({
          message: `Routing your query to ${routingTarget}...`,
          target: routingTarget,
        });

        // Get response from the routed assistant
        const routedResponse = await routeToAssistant(
          coordinatorResponse.routeFunction,
          originalQuery
        );

        // Clear routing info once we have the response
        setRoutingInfo(null);

        if (routedResponse) {
          finalResponse = routedResponse.message;
          assistantType =
            coordinatorResponse.routeFunction === "route_to_forecast"
              ? "Forecast Assistant"
              : "Sales Assistant";
        } else {
          finalResponse = "Failed to route your query. Please try again.";
        }
      } else {
        // Use coordinator's response directly
        finalResponse = coordinatorResponse.message;
      }

      const botMessage = {
        content: finalResponse,
        sender: "bot",
        assistantType: assistantType,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message to assistant:", error);

      // Check if this is an active run error
      if (error.message && error.message.startsWith("ACTIVE_RUN_ERROR:")) {
        // Extract thread ID from error message if available
        const errorMsg = error.message.substring("ACTIVE_RUN_ERROR:".length);

        const errorMessage = {
          content:
            "There's an active conversation still processing. Would you like to cancel it and start a new one?",
          sender: "bot",
          timestamp: new Date().toISOString(),
          isError: true,
          actionButton: {
            label: "Cancel Active Run",
            action: async () => {
              try {
                setIsLoading(true);
                // Retry the message with cancelActiveRun flag
                const threadId = localStorage.getItem("currentThreadId");
                const response = await apiService.sendMessageToAssistant(
                  originalQuery,
                  ASSISTANTS.COORDINATOR,
                  threadId,
                  true // Set cancelActiveRun to true
                );

                const botMessage = {
                  content: response.message,
                  sender: "bot",
                  assistantType: "Coordinator",
                  timestamp: new Date().toISOString(),
                };

                setMessages((prevMessages) => [...prevMessages, botMessage]);
              } catch (retryError) {
                console.error("Error after canceling run:", retryError);

                const retryErrorMessage = {
                  content:
                    "Sorry, there was an error processing your request even after canceling the active run.",
                  sender: "bot",
                  timestamp: new Date().toISOString(),
                  isError: true,
                };

                setMessages((prevMessages) => [...prevMessages, retryErrorMessage]);
              } finally {
                setIsLoading(false);
              }
            },
          },
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } else {
        // Handle other errors
        const errorMessage = {
          content:
            "Sorry, there was an error processing your request. Please try again later.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          isError: true,
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {" "}
      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to AI Assistant!</h2>
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender} ${msg.isError ? "error" : ""}`}
            >
              {msg.assistantType && (
                <div className="assistant-label">{msg.assistantType}</div>
              )}
              <div className="message-content">{msg.content}</div>
              {msg.actionButton && (
                <div className="message-action">
                  <button
                    onClick={msg.actionButton.action}
                    className="action-button"
                  >
                    {msg.actionButton.label}
                  </button>
                </div>
              )}
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {routingInfo && (
          <div className="message bot routing-info">
            <div className="assistant-label">Routing</div>
            <div className="message-content">{routingInfo.message}</div>
          </div>
        )}
        {isLoading && (
          <div className="message bot loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chatbot-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!inputMessage.trim() || isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
