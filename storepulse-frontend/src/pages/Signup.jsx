import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import PasswordRequirements from "../components/ui/PasswordRequirements";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
      await api.post("/auth/signup", { fullName, email, password });
      setSubmittedEmail(email);
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
            We sent a verification link to <strong>{submittedEmail}</strong>. Open it to
            activate your account, then log in.
          </p>
        </Card>
      </AuthLayout>
    );
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
            onFocus={() => setIsPasswordFocused(true)}
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

          <PasswordRequirements password={password} visible={isPasswordFocused} />

          {error && (
            <p className="text-sm" style={{ color: "var(--brick)" }}>
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
