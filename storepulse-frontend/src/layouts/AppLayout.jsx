import { User } from "lucide-react";
import Nav from "../components/ui/Nav";

/**
 * AppLayout — wraps every authenticated screen. Top nav (Dashboard /
 * Sites / Profile) replaces the old sidebar, matching the design.
 * Log out lives on the Profile page now, not in the nav itself.
 */
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Nav
        brandTo="/sites"
        links={[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/sites", label: "Sites" },
          { to: "/settings", label: "Profile", icon: <User className="h-4 w-4" /> },
        ]}
      />
      {children}
    </div>
  );
}
