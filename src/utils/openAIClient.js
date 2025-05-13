// filepath: d:\Dev\intelliplan\src\utils\openAIClient.js
import OpenAI from "openai";

// Create a shared OpenAI client instance
export const createOpenAIClient = () => {
  const client = new OpenAI({
    apiKey: process.env.REACT_APP_AZURE_OPENAI_KEY,
    baseURL: `${process.env.REACT_APP_AZURE_OPENAI_ENDPOINT.replace(
      /\/$/,
      ""
    )}/openai`, // Ensure /openai segment is present
    defaultQuery: {
      "api-version": "2024-05-01-preview", // Ensure this API version is supported
    },
    defaultHeaders: { "api-key": process.env.REACT_APP_AZURE_OPENAI_KEY }, // Added for Azure
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });

  return client;
};

// Export a singleton instance
export const openAIClient = createOpenAIClient();
