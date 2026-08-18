import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../lib/adminAuth";

/**
 * RequireAdminAuth — route guard for admin-only pages. Redirects to
 * /admin/login (preserving the attempted location) when there's no admin
 * session, entirely separate from RequireAuth's regular-user session.
 */
export default function RequireAdminAuth() {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
