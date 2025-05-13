require("dotenv/config");
const { AzureOpenAI } = require("openai");

class AzureOpenAIService {
  constructor() {
    this.azureOpenAIKey = process.env.REACT_APP_AZURE_OPENAI_KEY;
    this.azureOpenAIEndpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
    this.azureOpenAIVersion = "2024-05-01-preview";
    this.assistantId = process.env.REACT_APP_AI_ASSISTANT_ID;
    this.threadId = null;
    this.client = null;

    this.initialize();
  }

  initialize() {
    // Check env variables
    if (!this.azureOpenAIKey || !this.azureOpenAIEndpoint) {
      console.error(
        "Azure OpenAI credentials are not set in environment variables."
      );
      return;
    }

    // Initialize Azure SDK client
    try {
      this.client = new AzureOpenAI({
        endpoint: this.azureOpenAIEndpoint,
        apiVersion: this.azureOpenAIVersion,
        apiKey: this.azureOpenAIKey,
      });
      console.log("Azure OpenAI client initialized");
    } catch (error) {
      console.error("Error initializing Azure OpenAI client:", error);
    }
  }
  async createThread() {
    try {
      if (!this.client) {
        throw new Error("Azure OpenAI client is not initialized");
      }

      const thread = await this.client.beta.threads.create({});
      this.threadId = thread.id;
      console.log(`Thread created with ID: ${thread.id}`);
      return thread;
    } catch (error) {
      console.error(`Error creating thread: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(message, threadId = null) {
    try {
      if (!this.client) {
        throw new Error("Azure OpenAI client is not initialized");
      }

      // Use provided threadId or the instance threadId
      const currentThreadId = threadId || this.threadId;

      // Create a thread if none exists
      if (!currentThreadId) {
        const thread = await this.createThread();
        this.threadId = thread.id;
      }

      // Add message to thread
      const messageResponse = await this.client.beta.threads.messages.create(
        this.threadId,
        {
          role: "user",
          content: message,
        }
      );

      return messageResponse;
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
      throw error;
    }
  }
  async runAssistant(assistantId = null) {
    try {
      if (!this.client) {
        throw new Error("Azure OpenAI client is not initialized");
      }

      // Use provided assistantId or the instance assistantId
      const currentAssistantId = assistantId || this.assistantId;

      // Run the thread
      const runResponse = await this.client.beta.threads.runs.create(this.threadId, {
        assistant_id: this.assistantId,
      });

      // Poll for completion
      let runStatus = runResponse.status;
      while (runStatus === "queued" || runStatus === "in_progress") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const runStatusResponse = await this.client.beta.threads.runs.retrieve(
          this.threadId,
          runResponse.id
        );
        runStatus = runStatusResponse.status;
        console.log(`Current run status: ${runStatus}`);
      }

      // Get messages after completion
      if (runStatus === "completed") {
        const messagesResponse = await this.client.beta.threads.messages.list(
          this.threadId
        );

        // Return the latest assistant message
        const assistantMessages = messagesResponse.data.filter(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessages.length > 0) {
          return {
            answer: assistantMessages[0].content[0].text.value,
            conversationId: this.threadId,
          };
        } else {
          return {
            answer: "No response from assistant",
            conversationId: this.threadId,
          };
        }
      } else {
        console.log(`Run status is ${runStatus}, unable to fetch messages.`);
        return {
          answer: `The assistant encountered an issue. Status: ${runStatus}`,
          conversationId: this.threadId,
        };
      }
    } catch (error) {
      console.error(`Error running assistant: ${error.message}`);
      throw error;
    }
  }

  async getThreadMessages(threadId = null) {
    try {
      if (!this.client) {
        throw new Error("Azure OpenAI client is not initialized");
      }

      const currentThreadId = threadId || this.threadId;
      if (!currentThreadId) {
        throw new Error("No thread ID provided or available");
      }

      const messagesResponse = await this.client.beta.threads.messages.list(
        currentThreadId
      );
      return messagesResponse.data;
    } catch (error) {
      console.error(`Error getting thread messages: ${error.message}`);
      throw error;
    }
  }

  // Method to handle complete conversation flow
  async conversationHandler(message, conversationId = null) {
    try {
      // If conversationId is provided, use it as threadId
      if (conversationId) {
        this.threadId = conversationId;
      } else {
        // Create new thread if none exists
        if (!this.threadId) {
          await this.createThread();
        }
      } // Assistant is already configured with ID: asst_fJohmubFJ1rLarIbgKXXVV5c

      // Send message
      await this.sendMessage(message);

      // Run the assistant and get response
      const response = await this.runAssistant();

      return response;
    } catch (error) {
      console.error("Error in conversation handler:", error);
      return {
        answer: "Sorry, I encountered an error processing your request.",
        conversationId: this.threadId,
      };
    }
  }
}

// Export singleton instance
const azureOpenAIService = new AzureOpenAIService();
export default azureOpenAIService;
