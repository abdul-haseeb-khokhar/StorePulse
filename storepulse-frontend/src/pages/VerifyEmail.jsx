import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import BlankLayout from "../layouts/BlankLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // verifying | success | error
  const [status, setStatus] = useState(() => (token ? "verifying" : "error"));
  const [error, setError] = useState(() =>
    token ? null : "This verification link is missing its token.",
  );

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const requestedTokenRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    // The token is single-use server-side; StrictMode's dev-only double
    // effect invocation would otherwise fire this twice, and the second
    // (now-invalid) call would overwrite the first call's success result.
    // The ref (not per-run local state) is what makes the guard survive
    // across both invocations, so only one request is ever sent.
    if (requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;

    api
      .get("/auth/verify-email", { params: { token } })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(getApiErrorMessage(err, "This verification link is invalid or has expired."));
      });
  }, [token]);

  async function handleResend(e) {
    e.preventDefault();
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <BlankLayout>
      <Card elevation="md">
        {status === "verifying" && (
          <>
            <div className="card-kicker">One moment</div>
            <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
              Verifying your email…
            </div>
            <p className="card-body">Hang tight while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="flex items-center"
              style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} />
              <div className="card-title">Email verified</div>
            </div>
            <p className="card-body">
              Your account is ready. Close this tab and log in to your account.
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
              <div className="card-title">Verification failed</div>
            </div>
            <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
              {error}
            </p>

            {resendSent ? (
              <p className="text-sm" style={{ color: "var(--gold)" }}>
                If an account with that email exists and is unverified, a new link has been sent.
              </p>
            ) : (
              <form
                onSubmit={handleResend}
                className="grid"
                style={{ gap: "var(--space-3)" }}
              >
                <Field
                  id="resend-email"
                  label="Resend the verification link"
                  type="email"
                  placeholder="you@store.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                <Button type="submit" block loading={resendLoading}>
                  Resend email
                </Button>
              </form>
            )}
          </>
        )}
      </Card>
    </BlankLayout>
  );
}
