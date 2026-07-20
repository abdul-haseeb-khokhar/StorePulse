import { NavLink, useNavigate } from "react-router-dom";

/**
 * Nav — the top .nav bar used on every screen. `links` renders as
 * NavLinks (react-router sets aria-current="page" on the active one
 * automatically, which index.css keys off of); `actions` is a
 * right-side slot that varies per context (CTA button, log out, etc).
 */
export default function Nav({ links = [], actions = null, brandTo = "/" }) {
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <span className="nav-brand" style={{ cursor: "pointer" }} onClick={() => navigate(brandTo)}>
        StorePulse
      </span>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {link.label}
        </NavLink>
      ))}
      {actions}
    </nav>
  );
}
