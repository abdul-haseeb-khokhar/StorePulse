import { queryClient } from "./queryClient";

const ADMIN_TOKEN_KEY = "storepulse_admin_token";
const ADMIN_KEY = "storepulse_admin";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdmin() {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(ADMIN_KEY);
    return null;
  }
}

export function saveAdminSession({ token, admin }) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  queryClient.clear();
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}
