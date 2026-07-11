import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import Logo from "../components/ui/Logo";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";
import { saveSession } from "../lib/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { fullName, email, password });
      saveSession(data);
      navigate("/sites/new", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create your account. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-5">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Create your account</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          Start tracking your store&apos;s performance today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="fullName"
          label="Full Name"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="jane@storeowner.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-on-surface-variant hover:text-on-surface"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </form>

      <div className="my-5 h-px bg-outline-variant/50" />

      <p className="text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
