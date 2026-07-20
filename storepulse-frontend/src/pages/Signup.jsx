import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";
import { saveSession } from "../lib/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
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
      const { data } = await api.post("/auth/signup", { fullName, email, password });
      saveSession(data);
      navigate("/sites/new", { replace: true });
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "Could not create your account. Try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout switchTo="/login" switchLabel="Log in">
      <Card elevation="md">
        <div className="card-kicker">Get started</div>
        <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>
          Create your account
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
          <Field
            id="fullName"
            label="Full name"
            placeholder="Ada Okafor"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
            required
          />

          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Create account
          </Button>

          <p className="text-center text-xs" style={{ opacity: 0.65 }}>
            Already have one? <Link to="/login">Log in</Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
