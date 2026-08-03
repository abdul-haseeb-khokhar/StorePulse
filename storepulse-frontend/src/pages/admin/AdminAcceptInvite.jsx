import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import BlankLayout from "../../layouts/BlankLayout";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import PasswordRequirements from "../../components/ui/PasswordRequirements";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage, getFieldErrors } from "../../lib/api";

export default function AdminAcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // form | success | error
  const [status, setStatus] = useState(() => (token ? "form" : "error"));
  const [error, setError] = useState(() =>
    token ? null : "This invite link is missing its token.",
  );

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
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
      await adminApi.post("/admin/auth/accept-invite", { token, fullName, password });
      setStatus("success");
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "This invite link is invalid or has expired."));
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
            <div className="card-kicker">Admin invite</div>
            <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
              Set up your admin account
            </div>

            <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
              <Field
                id="fullName"
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                required
              />

              <Field
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                error={fieldErrors.password}
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

              <PasswordRequirements password={password} visible={isPasswordFocused} />

              {error && (
                <p className="text-sm" style={{ color: "var(--brick)" }}>
                  {error}
                </p>
              )}

              <Button type="submit" block loading={loading}>
                Activate account
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
              <div className="card-title">Account activated</div>
            </div>
            <p className="card-body">
              Your admin account is ready. Close this tab and log in from the admin login page.
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
              <div className="card-title">Invite failed</div>
            </div>
            <p className="card-body">{error}</p>
          </>
        )}
      </Card>
    </BlankLayout>
  );
}
