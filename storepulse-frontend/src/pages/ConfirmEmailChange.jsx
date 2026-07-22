import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function confirm() {
      if (!token) {
        setStatus("error");
        setError("This confirmation link is missing its token.");
        return;
      }
      try {
        await api.get("/auth/confirm-email-change", { params: { token } });
        if (!ignore) setStatus("success");
      } catch (err) {
        if (!ignore) {
          setStatus("error");
          setError(getApiErrorMessage(err, "This confirmation link is invalid or has expired."));
        }
      }
    }

    confirm();
    return () => {
      ignore = true;
    };
  }, [token]);

  const returnTo = isAuthenticated() ? "/settings" : "/login";
  const returnLabel = isAuthenticated() ? "Back to settings" : "Go to login";

  return (
    <AuthLayout switchTo="/login" switchLabel="Log in">
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
            <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
              Your new email address is confirmed.
            </p>
            <Link to={returnTo}>
              <Button block>{returnLabel}</Button>
            </Link>
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
    </AuthLayout>
  );
}
