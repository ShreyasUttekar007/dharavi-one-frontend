import axios from "axios";
import localforage from "localforage";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: `${API_URL}`, // optional if you're using full URLs
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await localforage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Catch 401 Unauthorized errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await localforage.removeItem("authToken");
      alert("Session expired. Please log in again.");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
