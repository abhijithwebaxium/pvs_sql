import axios from "axios";
import API_URL from "../config/api";
import store from "../store";
import { logout } from "../store/slices/userSlice";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract user-friendly error message from response
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";

    if (error.response?.status === 401) {
      // Clear Redux state and local storage
      store.dispatch(logout());

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Replace error message with user-friendly version
    error.message = errorMessage;
    return Promise.reject(error);
  },
);

export default api;
