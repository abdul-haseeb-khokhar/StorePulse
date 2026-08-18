/**
 * Shared Framer Motion presets — values lifted directly from the NYRON
 * design system's documented "Container Stagger" / "Item Fade-Up" patterns,
 * so grids of cards enter with the same staggered fade-up feel across every
 * NYRON product. Import these rather than redefining variants inline
 * (NYRON's own audit flags exactly that duplication as a thing to avoid).
 */
export { useReducedMotion } from "framer-motion";

export const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const itemFadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// NYRON's documented spring for slide-over panels (the mobile nav
// drawer here) — damping prevents bounce, stiffness keeps it snappy
// rather than languid.
export const drawerSpring = { type: "spring", damping: 25, stiffness: 250 };

// Re-exported so call sites import both the presets and the reduced-motion
// check from one place. Framer Motion's own animations aren't covered by
// the global CSS `@media (prefers-reduced-motion: reduce)` rule in
// index.css — that only forces CSS transition/animation durations to
// ~0, not JS-driven motion values — so components should check this and
// skip the `initial`/`whileInView` props (rendering the settled state
// directly) when it's true. Same idea as the local useReducedMotion
// hook already in HeroAnimation.jsx, just backed by the library's
// implementation instead of a second hand-rolled one.
