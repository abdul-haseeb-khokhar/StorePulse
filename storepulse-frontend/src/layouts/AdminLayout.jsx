import { useNavigate } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import { clearAdminSession, getStoredAdmin } from "../lib/adminAuth";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  const links = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/sites", label: "Sites" },
    { to: "/admin/payment-requests", label: "Payment Requests" },
    { to: "/admin/logs", label: "Logs" },
  ];
  if (admin?.role === "SUPERADMIN") {
    links.push({ to: "/admin/admins", label: "Admins" });
  }

  function handleLogout() {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <Nav
        links={links}
        actions={
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        }
      />
      {children}
    </div>
  );
}
