const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview";

export const fetchImageFromOpenAI = async (fileId) => {
  if (!fileId) {
    throw new Error("No file ID provided");
  }

  try {
    debugger;
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
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
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
