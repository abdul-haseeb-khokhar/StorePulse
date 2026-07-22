import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState(null);

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function verify() {
      if (!token) {
        setStatus("error");
        setError("This verification link is missing its token.");
        return;
      }
      try {
        await api.get("/auth/verify-email", { params: { token } });
        if (!ignore) setStatus("success");
      } catch (err) {
        if (!ignore) {
          setStatus("error");
          setError(getApiErrorMessage(err, "This verification link is invalid or has expired."));
        }
      }
    }

    verify();
    return () => {
      ignore = true;
    };
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
    <AuthLayout switchTo="/login" switchLabel="Log in">
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
            <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
              Your account is ready. You can log in now.
            </p>
            <Link to="/login">
              <Button block>Go to login</Button>
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
    </AuthLayout>
  );
}
