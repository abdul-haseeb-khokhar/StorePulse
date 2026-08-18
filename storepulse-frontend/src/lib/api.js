/**
 * Axios instance for regular-user API calls (token attach, 401 handling),
 * plus the shared helpers that turn backend validation errors into
 * user-facing messages.
 */
import axios from "axios";
import { clearSession, getToken } from "./auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// These never require a token — and shouldn't be sent one, since a stale
// token left over in storage would make a plain "wrong password" 401 from
// one of these look like an expired session to the response interceptor
// below (it can't tell "rejected my token" from "rejected my input" once a
// token is attached either way).
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
];

function isPublicPath(url) {
  return PUBLIC_PATHS.some((path) => url?.startsWith(path));
}

api.interceptors.request.use((config) => {
  if (!isPublicPath(config.url)) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A wrong "current password" on the change-password endpoint is also a
    // 401 on an authenticated request, but it's a validation outcome, not an
    // expired/invalid session — clearing the session here would log the user
    // out for mistyping it.
    const isWrongCurrentPassword =
      error.response?.data?.message === "Current password is incorrect";

    // Public endpoints never carry a token (see request interceptor above),
    // so a 401 anywhere else always means an authenticated request's session
    // is the problem, not a public endpoint rejecting its own input.
    if (
      error.response?.status === 401 &&
      !isPublicPath(error.config?.url) &&
      !isWrongCurrentPassword
    ) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Backend field names -> user-facing labels. The validate middleware
// (storepulse-backend/src/middleware/validate.js) reports paths like
// "body.email"; only the last segment is looked up here.
const FIELD_LABELS = {
  fullName: "Full name",
  email: "Email",
  password: "Password",
  currentPassword: "Current password",
  newPassword: "New password",
  newEmail: "New email",
  name: "Site name",
  domain: "Domain",
};

function fieldLabel(field) {
  return FIELD_LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

// Zod's own message is used whenever a schema defines one (e.g. "Password
// must contain at least one uppercase letter"). But a bare type/shape
// mismatch — wrong JS type, or a field missing entirely — falls back to
// Zod's generic default ("Invalid input: expected string, received
// number/undefined", "Invalid option: expected one of ...", "Required").
// Those aren't meaningful to a user, so this rewrites just that class of
// message into something tied to the actual field; anything else (a real
// custom validator message) passes through unchanged.
function humanizeMessage(field, message) {
  const label = fieldLabel(field);

  const typeMismatch = message.match(/^Invalid input: expected (\w+), received (\w+)$/i);
  if (typeMismatch) {
    const [, expected, received] = typeMismatch;
    if (received === "undefined" || received === "null") {
      return `${label} is required.`;
    }
    return `${label} must be a valid ${expected}.`;
  }

  if (/^Invalid option: expected one of/i.test(message)) {
    return `${label} is invalid.`;
  }

  if (/^Required$/i.test(message)) {
    return `${label} is required.`;
  }

  return message;
}

/**
 * Maps the validate middleware's { details: [{ field, message }] } shape
 * into { [fieldName]: friendlyMessage }, for showing errors under each
 * form field rather than a single generic banner.
 *
 * @param {Error} error An axios error from a failed request.
 * @returns {Record<string, string>}
 */
export function getFieldErrors(error) {
  const details = error.response?.data?.details;
  if (!Array.isArray(details)) return {};

  // A field can fail more than one check (e.g. a password too short AND
  // missing a digit) — keep the first issue Zod reported for that field
  // rather than the last, since the chain runs shortest/most-fundamental
  // check first.
  const fieldErrors = {};
  for (const { field, message } of details) {
    const key = field.split(".").pop();
    if (key in fieldErrors) continue;
    fieldErrors[key] = humanizeMessage(key, message);
  }
  return fieldErrors;
}

/**
 * A single user-facing message for a failed request, for showing as a
 * generic banner (as opposed to getFieldErrors' per-field mapping).
 *
 * @param {Error} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Try again.") {
  // No `response` at all means the request never reached the server
  // (backend down, DNS failure, offline) rather than the server rejecting
  // it — that's a different problem than whatever `fallback` describes,
  // so it gets its own message instead of reusing a per-action fallback.
  if (!error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }

  const data = error.response.data;
  if (data?.message) return data.message;

  if (Array.isArray(data?.details) && data.details.length > 0) {
    const { field, message } = data.details[0];
    return humanizeMessage(field.split(".").pop(), message);
  }

  return fallback;
}

export default api;
