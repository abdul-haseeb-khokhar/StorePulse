import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

/**
 * Nav — the top .nav bar used on every screen. `links` renders as
 * NavLinks (react-router sets aria-current="page" on the active one
 * automatically, which index.css keys off of); `actions` is a
 * right-side slot that varies per context (CTA button, log out, etc).
 * The theme toggle lives here (before the first link) so every screen
 * gets it in the same spot without each page wiring it in separately.
 * The brand is plain text — not a link to anywhere.
 */
export default function Nav({ links = [], actions = null }) {
  return (
    <nav className="nav">
      <span className="nav-brand">StorePulse</span>
      <ThemeToggle />
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {link.icon}
          {link.label}
        </NavLink>
      ))}
      {actions}
    </nav>
  );
}
