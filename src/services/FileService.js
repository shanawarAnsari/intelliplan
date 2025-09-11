const API_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-05-01-preview";

// Cache to store already fetched file URLs
const fileCache = new Map();

/**
 * Fetches file content from OpenAI API using a file ID
 * @param {string} fileId - The OpenAI file ID to fetch
 * @returns {Promise<{blobUrl: string, filename: string}>} - A blob URL and filename for the file
 */
export const fetchFileFromOpenAI = async (fileId) => {
  if (!fileId) {
    console.error("[FileService] No file ID provided");
    throw new Error("No file ID provided");
  }

  if (fileCache.has(fileId)) {
    return fileCache.get(fileId);
  }

  try {
    const azureEndpoint = ENDPOINT.endsWith("/") ? ENDPOINT : `${ENDPOINT}/`;
    const url = `${azureEndpoint}openai/files/${fileId}/content?api-version=${API_VERSION}&t=${Date.now()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "api-key": API_KEY,
        Accept: "*/*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const disposition = response.headers.get("content-disposition");
    const contentType = response.headers.get("content-type");

    // Always use a PPTX filename for reports
    let filename = "FinalReport.pptx";

    // Try to get filename from content-disposition header
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/['"]/g, "").trim();
      // Always ensure PPTX extension
      if (!filename.toLowerCase().endsWith(".pptx")) {
        filename = filename + ".pptx";
      }
    }

    // Create the blob with the PPTX content type
    const blob = await response.blob();
    const blobWithType = new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const blobUrl = URL.createObjectURL(blobWithType);
    const result = { blobUrl, filename };
    fileCache.set(fileId, result);
    return result;
  } catch (error) {
    console.error("[FileService] Error fetching file:", error);
    throw error;
  }
};

export const revokeFileUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export default {
  fetchFileFromOpenAI,
  revokeFileUrl,
};
