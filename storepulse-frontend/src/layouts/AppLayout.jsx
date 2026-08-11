import AppHeader from "../components/ui/AppHeader";

/**
 * AppLayout — wraps every authenticated screen. Top nav (Dashboard /
 * Sites / Profile) replaces the old sidebar, matching the design.
 * Log out lives on the Profile page now, not in the nav itself.
 */
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
