import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

/**
 * Nav — the top .nav bar used on every screen. `links` renders as
 * NavLinks (react-router sets aria-current="page" on the active one
 * automatically, which index.css keys off of); `actions` is a
 * right-side slot that varies per context (CTA button, log out, etc).
 * The theme toggle lives here (before the first link) so every screen
 * gets it in the same spot without each page wiring it in separately.
 */
export default function Nav({ links = [], actions = null, brandTo = "/" }) {
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <span className="nav-brand" style={{ cursor: "pointer" }} onClick={() => navigate(brandTo)}>
        StorePulse
      </span>
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
