/**
 * AdminLayout — top nav for every admin screen, with a live-polled badge on
 * the "Payment Requests" link and superadmin-only links (Logs, Admins)
 * shown conditionally based on the logged-in admin's role.
 */
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, Globe, Receipt, ScrollText, ShieldCheck } from "lucide-react";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import { clearAdminSession, getStoredAdmin } from "../lib/adminAuth";
import adminApi from "../lib/adminApi";
import { queryKeys } from "../lib/queryKeys";

// 30s poll, not push — this is a "how many are waiting right now" count,
// not a real-time feed, so a periodic refetch is enough to keep the badge
// close to current without any new server infrastructure. Also gets
// refreshed on demand: AdminPaymentRequests.jsx's review mutation
// invalidates the ["admin", "payment-requests"] prefix on approve/reject,
// which this query key falls under, so acting on a request updates the
// badge immediately rather than waiting out the interval.
const PENDING_COUNT_POLL_MS = 30_000;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  const pendingCountQuery = useQuery({
    queryKey: queryKeys.admin.paymentRequestsPendingCount,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/payment-requests/pending-count");
      return data;
    },
    refetchInterval: PENDING_COUNT_POLL_MS,
  });
  // undefined (not 0) when there's nothing pending — Nav's NavBadge treats
  // null/undefined as "render nothing", same as every other link here that
  // never passes `badge` at all.
  const pendingCount = pendingCountQuery.data?.count > 0 ? pendingCountQuery.data.count : undefined;

  // Icons match AppHeader.jsx's convention (h-4 w-4, passed as link.icon,
  // rendered by Nav for both the desktop bar and the mobile drawer). The
  // count badge itself is a Nav-level concern (see NavBadge in Nav.jsx) —
  // anchored to the whole link, not the icon, so it renders correctly in
  // both the desktop bar and the mobile drawer.
  const links = [
    { to: "/admin", label: "Dashboard", end: true, icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { to: "/admin/sites", label: "Sites", icon: <Globe className="h-4 w-4" /> },
    { to: "/admin/payment-requests", label: "Payment Requests", icon: <Receipt className="h-4 w-4" />, badge: pendingCount },
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
