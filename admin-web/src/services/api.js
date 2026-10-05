import axios from "axios";
import navigationProgress from "./navigationProgress";

const rawBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const apiBaseUrl = rawBaseUrl ? `${rawBaseUrl}/api` : "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Attach token to every request and track in-system progress
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only track in-system authenticated requests once initial mount is complete
    if (navigationProgress.isInitialMountComplete() && !config.skipProgress) {
      navigationProgress.onRequestStart();
    }
  }
  return config;
});

// Normalize API success flags for legacy and new endpoints
api.interceptors.response.use(
  (response) => {
    const token = localStorage.getItem("token");
    if (token && navigationProgress.isInitialMountComplete() && !response.config?.skipProgress) {
      navigationProgress.onRequestEnd();
    }
    if (response?.data) {
      response.data.success = response.data.status ?? response.data.success;
    }
    return response;
  },
  (error) => {
    const token = localStorage.getItem("token");
    if (token && navigationProgress.isInitialMountComplete() && !error.config?.skipProgress) {
      navigationProgress.onRequestEnd();
    }

    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/google-login") ||
        error.config?.url?.includes("/auth/forgot-password") ||
        error.config?.url?.includes("/auth/reset-password");

      if (!isAuthEndpoint) {
        localStorage.clear();
        window.location.href = "/home";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
