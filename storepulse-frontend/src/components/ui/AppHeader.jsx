import { useState, useRef, useEffect, useId } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, CreditCard, LayoutDashboard, Globe, FileText, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavBadge from "./NavBadge";
import { drawerSpring, useReducedMotion } from "../../lib/motion";
import api from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

// Same reasoning as AdminLayout's pending-count poll: this is "how many are
// unread right now," not a real-time feed, so a periodic refetch is enough.
// Also refreshed on demand — NotificationsList.jsx's mark-read mutations
// invalidate this same query key, so reading a notification updates the
// badge immediately rather than waiting out the interval.
const UNREAD_COUNT_POLL_MS = 30_000;

/**
 * AppHeader — Dedicated Header for Authenticated Screens (`AppLayout.jsx`).
 * Right: Dashboard, Sites, Billing, Notifications, Docs, Profile.
 * NO Log In or Sign Up buttons anywhere (neither desktop nor mobile drawer).
 */
export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const unreadCountQuery = useQuery({
    queryKey: queryKeys.notifications.list({ page: 1, limit: 1 }),
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { page: 1, limit: 1 } });
      return data;
    },
    refetchInterval: UNREAD_COUNT_POLL_MS,
  });
  const unreadCount = unreadCountQuery.data?.unreadCount > 0 ? unreadCountQuery.data.unreadCount : undefined;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/sites", label: "Sites", icon: <Globe className="h-4 w-4" /> },
    { to: "/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
    { to: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" />, badge: unreadCount },
    { to: "/docs", label: "Docs", icon: <FileText className="h-4 w-4" /> },
    { to: "/settings", label: "Profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-[var(--z-header)] w-full border-b border-[var(--divider)] bg-[var(--paper)]/90 backdrop-blur-md transition-colors duration-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 sm:h-22 lg:h-[88px] flex items-center justify-between gap-4">
          
          {/* Left Cluster: Logo + Vertical Divider + Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0" aria-label="StorePulse Dashboard">
              <img
                src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo2.png"
                alt="StorePulse"
                className="h-10 sm:h-11 lg:h-12 w-auto object-contain logo-light"
              />
              <img
                src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo3.png"
                alt="StorePulse"
                className="h-10 sm:h-11 lg:h-12 w-auto object-contain logo-dark"
              />
            </Link>

            <div className="h-5 w-[1px] bg-[var(--divider-soft)] opacity-60 mx-1 shrink-0 hidden sm:block" />

            <div className="hidden sm:flex items-center shrink-0">
              <ThemeToggle />
            </div>
          </div>

          {/* Right Slot: Navigation Links (Dashboard, Sites, Profile) — NO Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <nav className="flex items-center gap-1 xl:gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="nav-link px-3.5 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] flex items-center gap-1.5 transition-colors"
                >
                  {link.icon}
                  <span>{link.label}</span>
                  <NavBadge count={link.badge} label="unread" />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Mobile Control Slot */}
          <div className="lg:hidden flex items-center gap-2.5 shrink-0">
            <div className="sm:hidden flex items-center shrink-0">
              <ThemeToggle />
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 rounded-xl border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] hover:border-[#DDBB55] flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls={drawerId}
            >
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer — NO Auth Buttons */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="nav-drawer-backdrop"
              onClick={() => setMobileOpen(false)}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />
            <motion.div
              key="drawer"
              ref={drawerRef}
              id={drawerId}
              className="nav-drawer bg-[var(--paper)] text-[var(--ink)]"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "100%" }}
              transition={reduceMotion ? { duration: 0 } : drawerSpring}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <img
                    src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo2.png"
                    alt="StorePulse"
                    className="h-10 w-auto object-contain logo-light"
                  />
                  <img
                    src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo3.png"
                    alt="StorePulse"
                    className="h-10 w-auto object-contain logo-dark"
                  />
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-ghost btn-icon"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col gap-2 py-4">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className="relative px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] flex items-center gap-2 rounded-xl hover:bg-[var(--paper-card)]"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    <NavBadge count={link.badge} label="unread" />
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
