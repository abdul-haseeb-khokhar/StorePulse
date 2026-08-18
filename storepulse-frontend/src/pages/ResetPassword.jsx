/**
 * ResetPassword — completes a password reset from the emailed link: sets a
 * new password against the token in the URL.
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import BlankLayout from "../layouts/BlankLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import PasswordRequirements from "../components/ui/PasswordRequirements";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // form | success | error
  const [status, setStatus] = useState(() => (token ? "form" : "error"));
  const [error, setError] = useState(() =>
    token ? null : "This reset link is missing its token.",
  );

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setStatus("success");
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "This reset link is invalid or has expired."));
        setStatus("error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <BlankLayout>
      <Card elevation="md">
        {status === "form" && (
          <>
            <div className="card-kicker">Reset your password</div>
            <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
              Choose a new password
            </div>

            <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
              <Field
                id="newPassword"
                label="New password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                error={fieldErrors.newPassword}
                maxLength={50}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-muted"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                required
              />

              <PasswordRequirements password={newPassword} visible={isPasswordFocused} />

              {error && (
                <p className="text-sm" style={{ color: "var(--brick)" }}>
                  {error}
                </p>
              )}

              <Button type="submit" block loading={loading}>
                Reset password
              </Button>
            </form>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="flex items-center"
              style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} />
              <div className="card-title">Password reset</div>
            </div>
            <p className="card-body">
              Your password has been reset. Close this tab and log in to your account.
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
              <div className="card-title">Reset failed</div>
            </div>
            <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
              {error}
            </p>
            <Link to="/forgot-password">
              <Button variant="secondary" block>
                Request a new link
              </Button>
            </Link>
          </>
        )}
      </Card>
    </BlankLayout>
  );
}
