import Sidebar from "../components/ui/Sidebar";

/**
 * AppLayout — wraps every authenticated screen (Dashboard, Sites,
 * Add Site, API key confirmation, Settings). Renders the persistent
 * Sidebar and leaves the topbar to each page itself, since the topbar
 * content differs per page (site switcher vs search vs nothing).
 */
export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
