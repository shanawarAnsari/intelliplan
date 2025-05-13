const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview";

export const fetchImageFromOpenAI = async (fileId) => {
  try {
    if (!fileId) {
      throw new Error("No file ID provided");
    }

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
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image from Azure OpenAI:", error);
    throw error;
  }
};

export const revokeImageUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export default {
  fetchImageFromOpenAI,
  revokeImageUrl,
};
