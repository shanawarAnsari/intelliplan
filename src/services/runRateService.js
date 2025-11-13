import { getApi } from "./common";

export const getRunRate = async () => {
  try {
    const response = await getApi("runRate/getRunRateData");

    if (!response) {
      throw new Error("No data received from server");
    }

    return response;
  } catch (error) {
    console.error("Error fetching run rate data:", error);

    // Provide more specific error messages
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (status === 404) {
        throw new Error("Run rate data endpoint not found.");
      } else if (status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw new Error(`Request failed: ${error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error("Network error. Please check your connection.");
    } else {
      // Other errors
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};
