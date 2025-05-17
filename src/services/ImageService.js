const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview";

export const fetchImageFromOpenAI = async (fileId) => {
  if (!fileId) {
    throw new Error("No file ID provided");
  }

  // Make sure fileId is properly formatted
  const formattedFileId = fileId.startsWith("assistant-")
    ? fileId
    : `assistant-${fileId}`;

  try {
    const azureEndpoint = ENDPOINT.endsWith("/") ? ENDPOINT : `${ENDPOINT}/`;
    const url = `${azureEndpoint}openai/files/${formattedFileId}/content?api-version=${API_VERSION}`;

    console.log(`Fetching image from URL (cache miss): ${url}`);

    // Add retry logic for network issues
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "api-key": API_KEY,
            Accept: "image/*",
            "Cache-Control": "no-cache", // Prevent caching issues
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(
              `Image not found (404). Will retry ${maxRetries - retries} more times.`
            );
            retries++;
            await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
            continue;
          }

          console.error("Image fetch response:", await response.text());
          throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`
          );
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log(`Image fetched for fileId: ${formattedFileId}`);
        return blobUrl;
      } catch (fetchError) {
        console.error(`Fetch attempt ${retries + 1} failed:`, fetchError);
        retries++;

        if (retries >= maxRetries) {
          throw fetchError;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  } catch (error) {
    console.error("Error fetching image from Azure OpenAI:", error);
    throw error;
  }
};

export const revokeImageUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
    console.log(`Revoked blob URL`);
  }
};

export default {
  fetchImageFromOpenAI,
  revokeImageUrl,
};
