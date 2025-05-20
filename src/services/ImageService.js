const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview";

// Cache to store already fetched image URLs
const imageCache = new Map();

/**
 * Displays an image on the screen using the blob URL
 * @param {string} blobUrl - The blob URL of the image to display
 */
export const displayImage = (blobUrl) => {
  // If we're in a browser environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // Check if an image viewer container already exists
    let imageViewer = document.getElementById("openai-image-viewer");

    // If not, create one
    if (!imageViewer) {
      imageViewer = document.createElement("div");
      imageViewer.id = "openai-image-viewer";
      imageViewer.style.position = "fixed";
      imageViewer.style.top = "50%";
      imageViewer.style.left = "50%";
      imageViewer.style.transform = "translate(-50%, -50%)";
      imageViewer.style.zIndex = "9999";
      imageViewer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      imageViewer.style.padding = "20px";
      imageViewer.style.borderRadius = "5px";
      imageViewer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

      // Add close button
      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.position = "absolute";
      closeButton.style.top = "10px";
      closeButton.style.right = "10px";
      closeButton.style.padding = "5px 10px";
      closeButton.style.cursor = "pointer";
      closeButton.onclick = () => {
        document.body.removeChild(imageViewer);
      };

      imageViewer.appendChild(closeButton);
      document.body.appendChild(imageViewer);
    } else {
      // Clear existing content except the close button
      const closeButton = imageViewer.querySelector("button");
      imageViewer.innerHTML = "";
      if (closeButton) {
        imageViewer.appendChild(closeButton);
      }
    }

    // Create and add the image
    const img = document.createElement("img");
    img.src = blobUrl;
    img.style.maxWidth = "90vw";
    img.style.maxHeight = "80vh";
    img.style.display = "block";
    img.style.margin = "0 auto";

    imageViewer.appendChild(img);
  }

  return blobUrl;
};

/**
 * Fetches image content from OpenAI API using a file ID
 * @param {string} fileId - The OpenAI file ID to fetch
 * @returns {Promise<string>} - A blob URL for the image
 */
export const fetchImageFromOpenAI = async (fileId) => {
  if (!fileId) {
    console.error("[ImageService] No file ID provided");
    throw new Error("No file ID provided");
  }

  console.log(`[ImageService] Starting fetch for fileId: ${fileId}`);

  // Check cache first
  if (imageCache.has(fileId)) {
    console.log(`[ImageService] Using cached image for ${fileId}`);
    const cachedUrl = imageCache.get(fileId);
    // Return the cached URL without automatically displaying it
    return cachedUrl;
  }

  try {
    const azureEndpoint = ENDPOINT.endsWith("/") ? ENDPOINT : `${ENDPOINT}/`;
    // Add a timestamp to prevent browser caching
    const url = `${azureEndpoint}openai/files/${fileId}/content?api-version=${API_VERSION}&t=${Date.now()}`;

    console.log(`[ImageService] Fetching image from URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "api-key": API_KEY,
        Accept: "image/*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ImageService] Error response: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Cache the result
    imageCache.set(fileId, blobUrl);
    console.log(`[ImageService] Successfully fetched image for ${fileId}`);

    // Display the image automatically and return URL
    return blobUrl;
  } catch (error) {
    console.error("[ImageService] Error fetching image:", error);
    throw error;
  }
};

/**
 * Properly disposes of blob URLs to prevent memory leaks
 * @param {string} url - The blob URL to revoke
 */
export const revokeImageUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Clear all cached images and revoke their URLs
 */
export const clearImageCache = () => {
  for (const url of imageCache.values()) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
  imageCache.clear();
};

export default {
  fetchImageFromOpenAI,
  revokeImageUrl,
  clearImageCache,
  displayImage,
};
