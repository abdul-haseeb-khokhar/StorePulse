import { Link } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";

/**
 * AuthLayout — wraps Login and Signup. Top nav (Overview link + a
 * secondary button that switches between the two) above a centered
 * card, matching the design. `switchTo`/`switchLabel` let each page
 * say what the nav's secondary action should do.
 */
export default function AuthLayout({ children, switchTo, switchLabel }) {
  return (
    <div className="min-h-screen">
      <Nav
        brandTo="/"
        links={[{ to: "/", label: "Overview", end: true }]}
        actions={
          <Link to={switchTo}>
            <Button variant="secondary">{switchLabel}</Button>
          </Link>
        }
      />
      <div
        className="mx-auto w-full px-4"
        style={{ maxWidth: 400, marginTop: "var(--space-8)", marginBottom: "var(--space-8)" }}
      >
        {children}
      </div>
    </div>
  );
}
