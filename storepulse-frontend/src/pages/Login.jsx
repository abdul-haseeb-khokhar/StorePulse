import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { ContactLink } from "../components/ui/ContactLink";
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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [banned, setBanned] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setNeedsVerification(false);
    setResendSent(false);
    setBanned(false);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Both a banned account and an unverified email come back as 403 with
      // no other distinguishing field except this code — without it, a
      // banned user would also get the "resend verification link" banner
      // below, which is wrong: there's no link that will ever let them in.
      const isBanned = err.response?.data?.code === "ACCOUNT_BANNED";
      if (isBanned) {
        setBanned(true);
      } else if (err.response?.status === 403) {
        setNeedsVerification(true);
      }
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0 && !isBanned) {
        setError(getApiErrorMessage(err, "Could not log in. Check your email and password."));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthLayout switchTo="/signup" switchLabel="Sign up">
      <Card elevation="md" className="p-6 sm:p-8 rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-lg">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#DDBB55]">
            WELCOME BACK
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] font-sora">
            Log in to StorePulse
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          <div className="flex justify-end text-xs">
            <Link to="/forgot-password" className="text-[var(--muted)] hover:text-[#DDBB55] transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-[var(--brick-soft)]/20 border border-[var(--brick)]/30 text-xs text-[var(--brick)] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Banned Account Banner — no resend/activation link, since there's
              nothing to verify; the only way back in is admin support. */}
          {banned && (
            <div className="p-3 rounded-xl bg-[var(--brick-soft)]/20 border border-[var(--brick)]/30 text-xs text-[var(--brick)] flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <Ban className="h-4 w-4 shrink-0 mt-0.5" />
                <span>This account has been banned by an admin. Contact us if you think this is a mistake.</span>
              </div>
              <div className="pl-6">
                <ContactLink variant="inline" />
              </div>
            </div>
          )}

          {/* Verification Resend Banner */}
          {needsVerification && (
            <div className="p-3 rounded-xl bg-[#DDBB55]/10 border border-[#DDBB55]/30 text-xs flex flex-col gap-2">
              {resendSent ? (
                <div className="flex items-center gap-2 text-[#DDBB55]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>If an account with that email exists, a new verification link has been sent.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--muted)]">Please verify your email address to log in.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={resendLoading}
                    onClick={handleResend}
                    className="shrink-0"
                  >
                    Resend Link
                  </Button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" size="md" loading={loading} className="w-full justify-center mt-2 shadow-xs">
            Log in
          </Button>

          <p className="text-center text-xs text-[var(--muted)] mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#DDBB55] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </form>

      </Card>
    </AuthLayout>
  );
}
