/**
 * ForgotPassword — requests a password-reset email. Shows the same
 * "check your email" confirmation whether or not the address has an
 * account, mirroring the backend's anti-enumeration response.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MailCheck } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedEmail, setSubmittedEmail] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmittedEmail(email);
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "Could not send the reset link. Try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <AuthLayout switchTo="/login" switchLabel="Log in">
        <Card elevation="md">
          <div
            className="flex items-center"
            style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
          >
            <MailCheck className="h-5 w-5" style={{ color: "var(--gold)" }} />
            <div className="card-title">Check your email</div>
          </div>
          <p className="card-body">
            If an account exists for <strong>{submittedEmail}</strong>, we've sent a password
            reset link. It expires in 1 hour.
          </p>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout switchTo="/login" switchLabel="Log in">
      <Card elevation="md">
        <div className="card-kicker">Reset your password</div>
        <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
          Forgot password
        </div>
        <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
          Enter your account email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            error={fieldErrors.email}
            required
          />

          {error && (
            <p className="text-sm" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          )}

          <Button type="submit" block loading={loading}>
            Send reset link
          </Button>

          <p className="text-center text-xs" style={{ opacity: 0.65 }}>
            Remembered it? <Link to="/login">Log in</Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
