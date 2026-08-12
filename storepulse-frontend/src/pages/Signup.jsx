import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MailCheck, AlertTriangle } from "lucide-react";
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

  /* Centered Success / Email Confirmation View */
  if (submittedEmail) {
    return (
      <AuthLayout switchTo="/login" switchLabel="Log in">
        <Card elevation="md" className="p-8 sm:p-10 rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-xl text-center flex flex-col items-center gap-4">
          
          <div className="h-14 w-14 rounded-full bg-[#DDBB55]/15 border border-[#DDBB55]/30 flex items-center justify-center text-[#DDBB55]">
            <MailCheck className="h-7 w-7" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] font-sora">
              Check your email
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              We sent a verification link to <strong className="text-[var(--ink)] font-semibold">{submittedEmail}</strong>. Open it to activate your account, then log in.
            </p>
          </div>

          <Link to="/login" className="w-full mt-2">
            <Button size="md" className="w-full justify-center">
              Go to Login
            </Button>
          </Link>

        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout switchTo="/login" switchLabel="Log in">
      <Card elevation="md" className="p-6 sm:p-8 rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-lg">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#DDBB55]">
            GET STARTED
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] font-sora">
            Create your account
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            id="fullName"
            label="Full name"
            placeholder="Ada Okafor"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
            maxLength={50}
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
            maxLength={50}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          <PasswordRequirements password={password} visible={isPasswordFocused} />

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-[var(--brick-soft)]/20 border border-[var(--brick)]/30 text-xs text-[var(--brick)] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="md" loading={loading} className="w-full justify-center mt-2 shadow-xs">
            Create account
          </Button>

          <p className="text-center text-xs text-[var(--muted)] mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-[#DDBB55] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>

      </Card>
    </AuthLayout>
  );
}
