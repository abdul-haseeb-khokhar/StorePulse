import { queryClient } from "./queryClient";

const TOKEN_KEY = "storepulse_token";
const USER_KEY = "storepulse_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Otherwise the next person to log in on this tab (e.g. a shared
  // computer) could briefly see the previous user's cached data — it's
  // still "fresh" as far as React Query knows, since nothing told it the
  // identity behind it just changed.
  queryClient.clear();
}

export function isAuthenticated() {
  return Boolean(getToken());
}
