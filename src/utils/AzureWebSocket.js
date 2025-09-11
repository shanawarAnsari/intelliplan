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

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = (event) => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionHandlers.onOpen.forEach((handler) => handler(event));
          resolve(event);
        };

        this.socket.onclose = (event) => {
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

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection attempt failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("Maximum reconnection attempts reached");
    }
  }

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

  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }

    this.messageHandlers.get(messageType).push(handler);
  }

  onConnection(event, handler) {
    if (this.connectionHandlers[event]) {
      this.connectionHandlers[event].push(handler);
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.close();
      this.isConnected = false;
    }
  }
}

export default AzureWebSocket;
