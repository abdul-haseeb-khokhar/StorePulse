import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";
import { saveSession } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/sites";
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
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
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
    <AuthLayout switchTo="/signup" switchLabel="Sign up">
      <Card elevation="md">
        <div className="card-kicker">Welcome back</div>
        <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
          Log in to StorePulse
        </div>

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
            <p className="text-sm" style={{ color: "#b3261e" }}>
              {error}
            </p>
          )}

          <Button type="submit" block loading={loading}>
            Log in
          </Button>

          <p className="text-center text-xs" style={{ opacity: 0.65 }}>
            No account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
