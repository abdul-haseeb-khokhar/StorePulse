import { Link } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";

/**
 * AuthLayout — Wraps Login, Signup, and auth pages. Perfectly centers the auth card
 * with top header navigation and footer clearance.
 */
export default function AuthLayout({ children, switchTo, switchLabel }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--paper)] text-[var(--ink)]">
      <Nav
        links={[
          { to: "/", label: "Overview", end: true },
          { to: "/docs", label: "Docs" },
        ]}
        actions={
          <Link to={switchTo}>
            <Button variant="secondary" size="sm">{switchLabel}</Button>
          </Link>
        }
      />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Bottom Footer Copyright with NYRON Product Logo */}
      <footer className="py-4 border-t border-[var(--divider-soft)]">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)] font-sora">
          <span>&copy; {new Date().getFullYear()} StorePulse. A product of</span>
          <a
            href="https://nyron-x.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:opacity-85 transition-opacity"
            title="NYRON Digital Solutions"
          >
            <img
              src="/NYRONDARK.svg"
              alt="NYRON"
              className="h-3.5 w-auto object-contain logo-light inline-block"
            />
            <img
              src="/NYRONLIGHT.svg"
              alt="NYRON"
              className="h-3.5 w-auto object-contain logo-dark inline-block"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
