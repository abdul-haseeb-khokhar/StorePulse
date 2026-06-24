import Sidebar from "../components/ui/Sidebar";

/**
 * AppLayout — wraps every authenticated screen (Dashboard, Sites,
 * Add Site, API key confirmation, Settings). Renders the persistent
 * Sidebar and leaves the topbar to each page itself, since the topbar
 * content differs per page (site switcher vs search vs nothing).
 */
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
