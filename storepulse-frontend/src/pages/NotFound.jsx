import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import BlankLayout from "../layouts/BlankLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <BlankLayout>
      <Card elevation="md">
        <div
          className="flex items-center"
          style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
        >
          <Compass className="h-5 w-5" style={{ color: "var(--brick)" }} />
          <div className="card-title">Page not found</div>
        </div>
        <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/">
          <Button block>Go to homepage</Button>
        </Link>
      </Card>
    </BlankLayout>
  );
}
