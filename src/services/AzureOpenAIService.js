require("dotenv/config");
const { AzureOpenAI } = require("openai");
const {
  COORDINATOR_ASSISTANT_ID,
  FORECAST_ASSISTANT_ID,
  SALES_ASSISTANT_ID,
} = require("../utils/assistantConstants");

class AzureOpenAIService {
  constructor() {
    this.azureOpenAIKey = process.env.REACT_APP_AZURE_OPENAI_KEY;
    this.azureOpenAIEndpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
    this.azureOpenAIVersion = "2024-05-01-preview";

    // Assistant IDs from constants
    this.coordinatorAssistantId = COORDINATOR_ASSISTANT_ID; // Test_CoordinatorAssistant_Ahmad
    this.forecastAssistantId = FORECAST_ASSISTANT_ID; // ForecastAssistant
    this.salesAssistantId = SALES_ASSISTANT_ID; // SalesAssistant

    // Default to coordinator
    this.assistantId = this.coordinatorAssistantId;

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
  async runAssistant(assistantId = null, threadId = null) {
    try {
      if (!this.client) {
        throw new Error("Azure OpenAI client is not initialized");
      }

      // Use provided assistantId or the instance assistantId
      const currentAssistantId = assistantId || this.assistantId;

      // Run the thread
      const runResponse = await this.client.beta.threads.runs.create(
        threadId || this.threadId,
        {
          assistant_id: currentAssistantId,
        }
      );

      // Poll for completion
      let runStatus = runResponse.status;
      while (runStatus === "queued" || runStatus === "in_progress") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const runStatusResponse = await this.client.beta.threads.runs.retrieve(
          threadId || this.threadId,
          runResponse.id
        );
        runStatus = runStatusResponse.status;
        console.log(`Current run status: ${runStatus}`);
      }

      // Get messages after completion
      if (runStatus === "completed") {
        const messagesResponse = await this.client.beta.threads.messages.list(
          threadId || this.threadId
        );

        // Return the latest assistant message
        const assistantMessages = messagesResponse.data.filter(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessages.length > 0) {
          return {
            answer: assistantMessages[0].content[0].text.value,
            conversationId: threadId || this.threadId,
          };
        } else {
          return {
            answer: "No response from assistant",
            conversationId: threadId || this.threadId,
          };
        }
      } else {
        console.log(`Run status is ${runStatus}, unable to fetch messages.`);
        return {
          answer: `The assistant encountered an issue. Status: ${runStatus}`,
          conversationId: threadId || this.threadId,
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
  // Extract text content from a message
  extractTextContent(content) {
    if (!content) return "";

    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .filter((block) => block.type === "text")
        .map((block) => block.text?.value || "")
        .join("\n");
    }

    if (content.type === "text") {
      return content.text?.value || "";
    }

    return JSON.stringify(content);
  }

  // Handle tool calls from the coordinator assistant
  async handleToolCalls(threadId, runId) {
    try {
      console.log(`Checking for tool calls on run ${runId} in thread ${threadId}`);

      // Retrieve the current run
      let run = await this.client.beta.threads.runs.retrieve(threadId, runId);

      // If there are no required actions, return null
      if (
        !run.required_action ||
        run.required_action.type !== "submit_tool_outputs"
      ) {
        return null;
      }

      console.log("Tool outputs required from coordinator assistant");
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      const toolResults = [];

      for (const call of toolCalls) {
        const functionName = call.function.name;
        const args = JSON.parse(call.function.arguments);
        console.log(`Handling tool call: ${functionName} with args:`, args);

        let assistantId, assistantName;

        // Determine which assistant to use based on function name
        if (functionName === "route_to_sales") {
          assistantId = this.salesAssistantId;
          assistantName = "Sales";
        } else if (functionName === "route_to_forecast") {
          assistantId = this.forecastAssistantId;
          assistantName = "Forecast";
        } else {
          console.warn(`Unknown function: ${functionName}`);
          continue;
        }

        console.log(`Routing to ${assistantName} Assistant`);

        // Create a new thread for the specialized assistant
        const subThread = await this.client.beta.threads.create();
        console.log(`Created sub-thread: ${subThread.id}`);

        // Send the prompt to the specialized assistant
        await this.client.beta.threads.messages.create(subThread.id, {
          role: "user",
          content: args.prompt || args.query || "",
        });

        // Run the specialized assistant
        let subRun = await this.client.beta.threads.runs.create(subThread.id, {
          assistant_id: assistantId,
        });

        // Wait for the specialized assistant to complete
        let subRunStatus = subRun.status;
        while (["queued", "in_progress"].includes(subRunStatus)) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const subRunResponse = await this.client.beta.threads.runs.retrieve(
            subThread.id,
            subRun.id
          );
          subRunStatus = subRunResponse.status;
          console.log(`Specialized assistant status: ${subRunStatus}`);
        }

        // Get the response from the specialized assistant
        if (subRunStatus === "completed") {
          const messagesResponse = await this.client.beta.threads.messages.list(
            subThread.id,
            { order: "asc" }
          );
          const lastMessage = messagesResponse.data.find(
            (msg) => msg.role === "assistant"
          );

          if (lastMessage) {
            const output = this.extractTextContent(lastMessage.content);
            console.log(`${assistantName} Assistant response:`, output);

            // Add metadata to identify source assistant
            const outputWithMetadata = {
              content: output,
              assistantName: assistantName,
              source: "specialized_assistant",
            };

            toolResults.push({
              tool_call_id: call.id,
              output: JSON.stringify(outputWithMetadata),
            });
          }
        } else {
          console.error(`Specialized assistant failed with status: ${subRunStatus}`);
          toolResults.push({
            tool_call_id: call.id,
            output: `Error: ${subRunStatus}`,
          });
        }
      }

      // Submit tool outputs back to the coordinator
      if (toolResults.length > 0) {
        console.log(
          `Submitting ${toolResults.length} tool outputs back to coordinator`
        );
        const submitResponse = await this.client.beta.threads.runs.submitToolOutputs(
          threadId,
          runId,
          { tool_outputs: toolResults }
        );
        return submitResponse;
      }

      return null;
    } catch (error) {
      console.error("Error handling tool calls:", error);
      return null;
    }
  }

  // Wait for a run to complete
  async waitForRunCompletion(threadId, runId) {
    try {
      let run = await this.client.beta.threads.runs.retrieve(threadId, runId);

      while (true) {
        console.log(`Run status: ${run.status}`);

        if (run.status === "completed") {
          return run;
        } else if (run.status === "requires_action") {
          // Handle tool calls and get a new run ID if available
          const newRunResponse = await this.handleToolCalls(threadId, runId);

          if (newRunResponse) {
            // Continue polling for completion
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await this.client.beta.threads.runs.retrieve(threadId, runId);
          } else {
            throw new Error("Failed to handle tool calls properly");
          }
        } else if (["failed", "cancelled", "expired"].includes(run.status)) {
          console.error(`Run ended with status: ${run.status}`);
          throw new Error(`Assistant run failed with status: ${run.status}`);
        } else {
          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          run = await this.client.beta.threads.runs.retrieve(threadId, runId);
        }
      }
    } catch (error) {
      console.error("Error while waiting for run completion:", error);
      throw error;
    }
  }

  // Method to handle complete conversation flow
  async conversationHandler(message, conversationId = null, assistantId = null) {
    try {
      // Always use coordinator assistant initially
      const coordinatorId = this.coordinatorAssistantId;

      // Send message to the thread
      await this.sendMessage(message, conversationId);

      // Create a run with the coordinator assistant
      const run = await this.client.beta.threads.runs.create(
        conversationId || this.threadId,
        { assistant_id: coordinatorId }
      );

      console.log(`Run created with ID: ${run.id}`);

      // Wait for the run to complete, handling any tool calls
      await this.waitForRunCompletion(conversationId || this.threadId, run.id);

      // Get all messages from the thread
      const messagesResponse = await this.client.beta.threads.messages.list(
        conversationId || this.threadId
      );

      // Find the last assistant message
      const assistantMessages = messagesResponse.data.filter(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessages.length === 0) {
        throw new Error("No response from assistant");
      }
      const lastMessage = assistantMessages[0];
      const rawAnswerText = this.extractTextContent(lastMessage.content);
      let answerText = rawAnswerText;
      let assistantName = "Coordinator";
      let routedFrom = null;

      console.log("Raw final answer:", rawAnswerText);

      // Check for text-based routing instructions
      if (
        rawAnswerText.includes("Forecast Assistant will process") ||
        rawAnswerText.includes("routing to Forecast")
      ) {
        console.log("Detected text-based routing to Forecast Assistant");

        // Create a new message on the same thread, with the original query
        await this.client.beta.threads.messages.create(
          conversationId || this.threadId,
          {
            role: "user",
            content:
              "Please process this request as the Forecast Assistant: " + message,
          }
        );

        // Run the forecast assistant on the same thread
        const forecastRun = await this.client.beta.threads.runs.create(
          conversationId || this.threadId,
          { assistant_id: this.forecastAssistantId }
        );

        // Wait for forecast assistant to complete
        await this.waitForRunCompletion(
          conversationId || this.threadId,
          forecastRun.id
        );

        // Get updated messages
        const updatedMessagesResponse = await this.client.beta.threads.messages.list(
          conversationId || this.threadId
        );
        const updatedAssistantMessages = updatedMessagesResponse.data.filter(
          (msg) => msg.role === "assistant"
        );

        // The newest message should be from Forecast Assistant
        if (updatedAssistantMessages.length > 0) {
          const forecastMessage = updatedAssistantMessages[0];
          answerText = this.extractTextContent(forecastMessage.content);
          assistantName = "Forecast";
          routedFrom = "Coordinator";
        }
      } else if (
        rawAnswerText.includes("Sales Assistant will process") ||
        rawAnswerText.includes("routing to Sales")
      ) {
        console.log("Detected text-based routing to Sales Assistant");

        // Create a new message on the same thread, with the original query
        await this.client.beta.threads.messages.create(
          conversationId || this.threadId,
          {
            role: "user",
            content:
              "Please process this request as the Sales Assistant: " + message,
          }
        );

        // Run the sales assistant on the same thread
        const salesRun = await this.client.beta.threads.runs.create(
          conversationId || this.threadId,
          { assistant_id: this.salesAssistantId }
        );

        // Wait for sales assistant to complete
        await this.waitForRunCompletion(
          conversationId || this.threadId,
          salesRun.id
        );

        // Get updated messages
        const updatedMessagesResponse = await this.client.beta.threads.messages.list(
          conversationId || this.threadId
        );
        const updatedAssistantMessages = updatedMessagesResponse.data.filter(
          (msg) => msg.role === "assistant"
        );

        // The newest message should be from Sales Assistant
        if (updatedAssistantMessages.length > 0) {
          const salesMessage = updatedAssistantMessages[0];
          answerText = this.extractTextContent(salesMessage.content);
          assistantName = "Sales";
          routedFrom = "Coordinator";
        }
      }

      // Try to parse if this is a JSON response with metadata
      try {
        const possibleJson = JSON.parse(rawAnswerText);
        if (possibleJson && possibleJson.content && possibleJson.assistantName) {
          answerText = possibleJson.content;
          assistantName = possibleJson.assistantName;
          routedFrom = "Coordinator";
          console.log(`Response is from ${assistantName}, routed from Coordinator`);
        }
      } catch (e) {
        // Not JSON, just use the raw text from the coordinator
        console.log("Response is directly from Coordinator");
      }

      return {
        answer: answerText,
        conversationId: conversationId || this.threadId,
        assistantName: assistantName,
        routedFrom: routedFrom,
      };
    } catch (error) {
      console.error("Error in conversation handler:", error);
      return {
        answer:
          "Sorry, I encountered an error processing your request: " + error.message,
        conversationId: this.threadId,
      };
    }
  }
}

// Export singleton instance
const azureOpenAIService = new AzureOpenAIService();
export default azureOpenAIService;
