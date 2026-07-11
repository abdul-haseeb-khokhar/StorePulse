import { NavLink } from "react-router-dom";
import { LayoutDashboard, Globe, Settings, LogOut } from "lucide-react";
import Logo from "../ui/Logo";
import { clearSession } from "../../lib/auth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sites", label: "Sites", icon: Globe },
  { to: "/settings", label: "Settings", icon: Settings },
];

/**
 * Sidebar — left nav from screens 3, 5, 6. Kept deliberately small:
 * Dashboard / Sites / Settings, matching the simplified nav used in the
 * final dashboard screen rather than the longer 5-item list from the
 * earlier "Add Site" export, so the nav is consistent everywhere.
 */
export default function Sidebar() {
  function handleLogout() {
    clearSession();
    window.location.assign("/login");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-outline-variant/40 bg-surface-lowest px-4 py-5">
      <div className="mb-8 px-1">
        <Logo tagline="E-commerce Insights" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${
                isActive
                  ? "bg-primary-container/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-low"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
          text-on-surface-variant hover:bg-surface-low"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Logout
      </button>
    </aside>
  );
}
