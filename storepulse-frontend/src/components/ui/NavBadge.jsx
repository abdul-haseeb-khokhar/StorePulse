// Small count badge parked at the top-right corner of a nav link (e.g. the
// pending-count on AdminLayout's "Payment Requests" link, or the unread
// count on AppHeader's "Notifications" link). Shared between Nav.jsx and
// AppHeader.jsx — the two headers don't otherwise share code (AppHeader
// predates Nav and has its own independent desktop/drawer markup), but
// duplicating this one small piece across both beats forcing them onto one
// shared header component just for a badge.
//
// Anchors to the *link* itself, not just an icon, so it needs a positioned
// ancestor: Nav's desktop links already have one (`.nav-link` in index.css,
// originally for the underline hover treatment) and AppHeader's `nav-link`
// class carries the same rule; each header's mobile drawer link isn't
// positioned by default, so `relative` is added explicitly at each of
// those call sites.
export default function NavBadge({ count, label = "pending" }) {
  if (count == null) return null;
  return (
    <span
      className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brick)] px-1 text-[10px] font-semibold leading-none text-white"
      aria-label={`${count} ${label}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
