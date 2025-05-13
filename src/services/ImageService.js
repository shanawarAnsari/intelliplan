// Image service for handling Azure OpenAI image files
const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview"; // Azure OpenAI API version

/**
 * Fetch an image from the Azure OpenAI API by file ID
 * @param {string} fileId - The ID of the image file
 * @returns {Promise<string>} - A URL for the image (either data URL or blob URL)
 */
export const fetchImageFromOpenAI = async (fileId) => {
  try {
    if (!fileId) {
      throw new Error("No file ID provided");
    }

    // Use Azure OpenAI endpoint format
    const azureEndpoint = ENDPOINT.endsWith("/") ? ENDPOINT : `${ENDPOINT}/`;
    const url = `${azureEndpoint}openai/files/${fileId}/content?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "api-key": API_KEY,
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      console.error("Image fetch response:", await response.text());
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    // Get the image as a blob and create a URL for it
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image from Azure OpenAI:", error);
    throw error;
  }
};

/**
 * Clean up a blob URL to prevent memory leaks
 * @param {string} url - The blob URL to revoke
 */
export const revokeImageUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export default {
  fetchImageFromOpenAI,
  revokeImageUrl,
};
