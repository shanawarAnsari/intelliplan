// AzureWebSocket.js - Utility for handling WebSocket connections to Azure services
class AzureWebSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.messageHandlers = new Map();
    this.connectionHandlers = {
      onOpen: [],
      onClose: [],
      onError: [],
    };
  }

  /**
   * Connect to the WebSocket
   * @returns {Promise} Resolves when connected, rejects on error
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = (event) => {
          console.log("WebSocket connection established");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionHandlers.onOpen.forEach((handler) => handler(event));
          resolve(event);
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket connection closed");
          this.isConnected = false;
          this.connectionHandlers.onClose.forEach((handler) => handler(event));
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.connectionHandlers.onError.forEach((handler) => handler(error));
          reject(error);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to the WebSocket
   * @private
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection attempt failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("Maximum reconnection attempts reached");
    }
  }

  /**
   * Handle incoming messages
   * @param {MessageEvent} event - The message event
   * @private
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      const messageType = data.type || "default";

      if (this.messageHandlers.has(messageType)) {
        const handlers = this.messageHandlers.get(messageType);
        handlers.forEach((handler) => handler(data));
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  /**
   * Send a message through the WebSocket
   * @param {object|string} message - The message to send
   * @returns {boolean} True if sent, false if not connected
   */
  send(message) {
    if (!this.isConnected) {
      console.error("WebSocket is not connected");
      return false;
    }

    try {
      const messageString =
        typeof message === "string" ? message : JSON.stringify(message);

      this.socket.send(messageString);
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }

  /**
   * Register a message handler
   * @param {string} messageType - The type of message to handle
   * @param {function} handler - The handler function
   */
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }

    this.messageHandlers.get(messageType).push(handler);
  }

  /**
   * Register a connection event handler
   * @param {string} event - The event type (open, close, error)
   * @param {function} handler - The handler function
   */
  onConnection(event, handler) {
    if (this.connectionHandlers[event]) {
      this.connectionHandlers[event].push(handler);
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.close();
      this.isConnected = false;
    }
  }
}

// Export the class
export default AzureWebSocket;
