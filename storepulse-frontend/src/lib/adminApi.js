import axios from "axios";
import { API_BASE_URL } from "./api";
import { clearAdminSession, getAdminToken } from "./adminAuth";

// Separate axios instance and token from lib/api.js's `api` — admin identity
// is a distinct table/JWT on the backend (see protectAdmin.js), so a 401
// here must only clear the admin session, never the regular user's.
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminSession();
    }
    return Promise.reject(error);
  },
);

export default adminApi;
