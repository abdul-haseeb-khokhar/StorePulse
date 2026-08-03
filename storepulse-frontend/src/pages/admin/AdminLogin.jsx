import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import BlankLayout from "../../layouts/BlankLayout";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage, getFieldErrors } from "../../lib/api";
import { saveAdminSession } from "../../lib/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const { data } = await adminApi.post("/admin/auth/login", { email, password });
      saveAdminSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "Could not log in. Check your email and password."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <BlankLayout>
      <Card elevation="md">
        <div className="card-kicker">Admin</div>
        <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
          Log in to StorePulse admin
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="admin@store-pulse.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            error={fieldErrors.email}
            required
          />

          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            error={fieldErrors.password}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          {error && (
            <p className="text-sm" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          )}

          <Button type="submit" block loading={loading}>
            Log in
          </Button>
        </form>
      </Card>
    </BlankLayout>
  );
}
