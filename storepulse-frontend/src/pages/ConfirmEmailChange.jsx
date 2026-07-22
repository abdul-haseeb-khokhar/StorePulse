import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import BlankLayout from "../layouts/BlankLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // verifying | success | error
  const [status, setStatus] = useState(() => (token ? "verifying" : "error"));
  const [error, setError] = useState(() =>
    token ? null : "This confirmation link is missing its token.",
  );

  const requestedTokenRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    // Single-use server-side; the ref (not per-run local state) survives
    // StrictMode's dev-only double effect invocation, so only one request
    // is ever sent instead of a second (now-invalid) call overwriting the
    // first call's success result.
    if (requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;

    api
      .get("/auth/confirm-email-change", { params: { token } })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(getApiErrorMessage(err, "This confirmation link is invalid or has expired."));
      });
  }, [token]);

  const returnTo = isAuthenticated() ? "/settings" : "/login";
  const returnLabel = isAuthenticated() ? "Back to settings" : "Go to login";

  return (
    <BlankLayout>
      <Card elevation="md">
        {status === "verifying" && (
          <>
            <div className="card-kicker">One moment</div>
            <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
              Confirming your new email…
            </div>
            <p className="card-body">Hang tight while we update your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="flex items-center"
              style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} />
              <div className="card-title">Email updated</div>
            </div>
            <p className="card-body">
              Your new email address is confirmed. Close this tab and log in to your account.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="flex items-center"
              style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <XCircle className="h-5 w-5" style={{ color: "var(--brick)" }} />
              <div className="card-title">Confirmation failed</div>
            </div>
            <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
              {error}
            </p>
            <Link to={returnTo}>
              <Button variant="secondary" block>
                {returnLabel}
              </Button>
            </Link>
          </>
        )}
      </Card>
    </BlankLayout>
  );
}
