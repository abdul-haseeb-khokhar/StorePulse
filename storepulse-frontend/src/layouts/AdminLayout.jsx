import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Globe, Receipt, ScrollText, ShieldCheck } from "lucide-react";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import { clearAdminSession, getStoredAdmin } from "../lib/adminAuth";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  // Icons match AppHeader.jsx's convention (h-4 w-4, passed as link.icon,
  // rendered by Nav for both the desktop bar and the mobile drawer).
  const links = [
    { to: "/admin", label: "Dashboard", end: true, icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { to: "/admin/sites", label: "Sites", icon: <Globe className="h-4 w-4" /> },
    { to: "/admin/payment-requests", label: "Payment Requests", icon: <Receipt className="h-4 w-4" /> },
  ];
  if (admin?.role === "SUPERADMIN") {
    links.push({ to: "/admin/logs", label: "Logs", icon: <ScrollText className="h-4 w-4" /> });
    links.push({ to: "/admin/admins", label: "Admins", icon: <ShieldCheck className="h-4 w-4" /> });
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
