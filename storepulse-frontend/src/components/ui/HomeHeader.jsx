import { useState, useRef, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import { drawerSpring, useReducedMotion } from "../../lib/motion";

/**
 * HomeHeader — Dedicated Header for Landing Page (`/`).
 * Center: Story, Platform, Integration, Pricing, FAQ, Docs.
 * Right: Log In & Sign Up buttons (desktop & mobile drawer).
 */
export default function HomeHeader() {
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

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-[var(--z-header)] w-full border-b border-[var(--divider)] bg-[var(--paper)]/90 backdrop-blur-md transition-colors duration-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 sm:h-22 lg:h-[88px] flex items-center justify-between gap-4">
          
          {/* Left Cluster: Logo + Vertical Divider + Theme Toggle */}
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

          {/* Center Navigation Links (Story, Platform, Integration, Pricing, FAQ, Docs) */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className="flex items-center gap-1 xl:gap-2">
              <a href="/#story" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                Overview
              </a>
              <a href="/#platform" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                Capabilities
              </a>
              <a href="/#integration" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                Integration
              </a>
              <a href="/#pricing" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                Pricing
              </a>
              <a href="/#faq" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                FAQ
              </a>
              <Link to="/docs" className="nav-link px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors">
                Docs
              </Link>
            </nav>
          </div>

          {/* Right Action Slot (Log In & Sign Up) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
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

      {/* Mobile Slide-Over Drawer */}
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

              <div className="flex flex-col gap-2 py-4">
                <a
                  href="/#story"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  Overview
                </a>
                <a
                  href="/#platform"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  Capabilities
                </a>
                <a
                  href="/#integration"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  Integration
                </a>
                <a
                  href="/#pricing"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  Pricing
                </a>
                <a
                  href="/#faq"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  FAQ
                </a>
                <Link
                  to="/docs"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:text-[#DDBB55] rounded-xl hover:bg-[var(--paper-card)]"
                >
                  Docs
                </Link>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--divider)] flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" block>
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" block>
                    Sign Up
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
