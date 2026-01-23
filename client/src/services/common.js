import axios from "axios";
import { CONFIG } from "../runtimeConfig";

const BASE_URL = "http://localhost:80/api";

export const getApi = async (url, data = null, headers = {}) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${BASE_URL}/${url}`,
      params: data,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("authToken")}`,
        ...headers,
      },
      responseType: "json",
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.statusText || "Request failed");
    }
  } catch (error) {
    console.error(`API Error [GET ${url}]:`, error);

    // Enhance error with more context
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    throw error;
  }
};

export const postApi = async (url, data, headers = {}) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/${url}`,
      data: data,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("authToken")}`,
        ...headers,
      },
      responseType: "json",
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.statusText || "Request failed");
    }
  } catch (error) {
    console.error(`API Error [POST ${url}]:`, error);

    // Enhance error with more context
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    throw error;
  }
};
