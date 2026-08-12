import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../lib/auth";

/**
 * RequireGuest — mirror of RequireAuth. Gates the auth-entry pages
 * (login, signup, password reset) so a user with an active session
 * gets sent straight to their dashboard instead of the form.
 */
export default function RequireGuest() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
