import { useNavigate } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import { clearSession } from "../lib/auth";

/**
 * AppLayout — wraps every authenticated screen. Top nav (Sites /
 * Settings / Log out) replaces the old sidebar, matching the design.
 */
export default function AppLayout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <Nav
        brandTo="/sites"
        links={[
          { to: "/sites", label: "Sites" },
          { to: "/settings", label: "Settings" },
        ]}
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
