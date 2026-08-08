import { useEffect, useId, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { drawerSpring, useReducedMotion } from "../../lib/motion";

/**
 * Nav — the top .nav bar used on every screen. `links` renders as
 * NavLinks (react-router sets aria-current="page" on the active one
 * automatically, which index.css keys off of for the underline);
 * `actions` is a right-side slot that varies per context (CTA button,
 * log out, etc). The theme toggle lives here (before the first link)
 * so every screen gets it in the same spot without each page wiring it
 * in separately. The brand is plain text — not a link to anywhere.
 *
 * Below the `lg` breakpoint, links + actions collapse into a slide-over
 * drawer opened by a hamburger button, per NYRON's documented mobile
 * nav pattern — including its focus management: Escape closes it,
 * focus moves to the drawer's own close button on open and back to the
 * hamburger on close, Tab is trapped inside while it's open, and page
 * scroll is locked for the duration.
 *
 * The drawer/backdrop are rendered as SIBLINGS of <nav>, not children —
 * .nav has `backdrop-filter` for its frosted sticky-header look, and
 * per spec `backdrop-filter` makes an element a containing block for
 * its `position: fixed` descendants (same as `transform`/`filter`
 * would). Nesting the drawer inside <nav> made its `inset: 0` resolve
 * against nav's own ~68px-tall box instead of the viewport.
 */
export default function Nav({ links = [], actions = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const drawerId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    // Captured up front — by the time this cleanup runs (drawer closing),
    // the button that opened it may have unmounted or React may have
    // nulled the ref before the effect teardown fires.
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 50);

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">StorePulse</span>
        <ThemeToggle />

        <div className="hidden lg:flex items-center gap-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.icon}
              {link.label}
            </NavLink>
          ))}
          {actions}
        </div>

        {/* Wrapped rather than putting `lg:hidden` directly on the button:
            Tailwind v4 utilities live in a CSS cascade layer, and .btn's
            plain (unlayered) `display: inline-flex` always outranks a
            layered utility regardless of source order, so `lg:hidden`
            alone on the button itself was silently losing. A wrapper
            with no competing custom class sidesteps that. */}
        <div className="lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen(true)}
            className="btn btn-ghost btn-icon"
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls={drawerId}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              className="nav-drawer-backdrop"
              onClick={() => setIsOpen(false)}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />
            <motion.div
              key="drawer"
              ref={drawerRef}
              id={drawerId}
              className="nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "100%" }}
              transition={reduceMotion ? { duration: 0 } : drawerSpring}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <span className="nav-brand">StorePulse</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-icon"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid" style={{ gap: "var(--space-1)" }}>
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setIsOpen(false)}
                    className="nav-drawer-link nav-link"
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {actions && (
                <div style={{ marginTop: "auto" }} onClick={() => setIsOpen(false)}>
                  {actions}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
