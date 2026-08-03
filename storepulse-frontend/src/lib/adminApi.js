import axios from "axios";
import { API_BASE_URL } from "./api";
import { clearAdminSession, getAdminToken } from "./adminAuth";

// Separate axios instance and token from lib/api.js's `api` — admin identity
// is a distinct table/JWT on the backend (see protectAdmin.js), so a 401
// here must only clear the admin session, never the regular user's.
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Never require — and shouldn't be sent — a token: attaching a stale one
// left over in storage would make a plain "wrong password" 401 from these
// look like an expired session to the response interceptor below.
const PUBLIC_PATHS = ["/admin/auth/login", "/admin/auth/accept-invite"];

function isPublicPath(url) {
  return PUBLIC_PATHS.some((path) => url?.startsWith(path));
}

adminApi.interceptors.request.use((config) => {
  if (!isPublicPath(config.url)) {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Public endpoints never carry a token (see request interceptor above),
    // so a 401 anywhere else always means an authenticated request's session
    // is the problem, not a public endpoint rejecting its own input (e.g.
    // bad login credentials).
    if (error.response?.status === 401 && !isPublicPath(error.config?.url)) {
      clearAdminSession();
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default adminApi;
