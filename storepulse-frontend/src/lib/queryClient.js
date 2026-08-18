/**
 * Shared React Query client, with a retry policy that skips retrying
 * client errors (they won't succeed on retry) and a 401 already handled by
 * lib/api.js's interceptor.
 */
import { QueryClient } from "@tanstack/react-query";

function shouldRetry(failureCount, error) {
  const status = error?.response?.status;
  // A real 401 already clears the session via lib/api.js's response
  // interceptor; retrying just re-triggers that. Other 4xx are the server
  // rejecting the request as invalid, not a transient failure.
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
