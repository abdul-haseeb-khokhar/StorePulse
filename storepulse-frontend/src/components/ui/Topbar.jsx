import { Bell, HelpCircle } from "lucide-react";
import { getStoredUser } from "../../lib/auth";

/**
 * Topbar — right side of the app shell. Takes children so each page
 * can drop in its own left-side content (site switcher + date range
 * on the dashboard, a search field on "Add site", nothing on Sites list)
 * without the Topbar needing to know about every page's specifics.
 */
export default function Topbar({ children, userName = "Alex Rivera", userPlan = "Pro Plan" }) {
  const user = getStoredUser();
  const displayName = user?.fullName || userName;

  return (
    <header className="flex h-16 items-center justify-between border-b border-outline-variant/40
      bg-surface-lowest px-6">
      <div className="flex-1">{children}</div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5 pl-2">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-on-surface">{displayName}</p>
            <p className="text-xs leading-tight text-on-surface-variant">{userPlan}</p>
          </div>
          <div
            className="h-9 w-9 rounded-full bg-primary-container/30"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
