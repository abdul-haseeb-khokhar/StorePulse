import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavBadge from "./NavBadge";
import { drawerSpring, useReducedMotion } from "../../lib/motion";

/**
 * Nav — Header component modeled after top enterprise navigation bars
 * (SEMRUSH style layout) integrated with StorePulse's RBG SVG logos,
 * pill actions, theme toggle, and NYRON Design System standards.
 *
 * Both call sites (AuthLayout, AdminLayout) always pass `links` and
 * `actions` explicitly — this used to also carry a generic marketing-nav
 * fallback for when either was omitted, but the landing page has its own
 * dedicated HomeHeader now, so that path was unreachable. Removed rather
 * than kept "just in case" — `links`/`actions` are required.
 */

export default function Nav({ links, actions }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const drawerId = useId();

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock scroll during mobile menu
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const menuBtn = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
      menuBtn?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-[var(--z-header)] w-full border-b border-[var(--divider)] bg-[var(--paper)]/90 backdrop-blur-md transition-colors duration-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 sm:h-22 lg:h-[88px] flex items-center justify-between gap-4">
          {/* Left Cluster: Logo + Vertical Divider + Theme Toggle (Inline) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="StorePulse Homepage">
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

          {/* Center Navigation Links (Flex-1 + justify-center for perfect centering!) */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className="flex items-center gap-1 xl:gap-2">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] flex items-center gap-1.5 transition-colors">
                  {link.icon}
                  <span>{link.label}</span>
                  <NavBadge count={link.badge} />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Action Slot */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {actions}
          </div>

          {/* Mobile Control Slot (Inline Theme Toggle on XS + Hamburger Menu) */}
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

      {/* Mobile Slide-Over Drawer Navigation */}
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
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
                <Link to="/" onClick={() => setMobileOpen(false)}>
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

              {/* Drawer Links */}
              <div className="flex flex-col gap-2 py-4">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className="relative px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[var(--stamp)] flex items-center gap-2 rounded-xl hover:bg-[var(--stamp-soft)]/50"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    <NavBadge count={link.badge} />
                  </NavLink>
                ))}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="mt-auto pt-4 border-t border-[var(--divider)] flex flex-col gap-3">
                <div onClick={() => setMobileOpen(false)}>{actions}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
