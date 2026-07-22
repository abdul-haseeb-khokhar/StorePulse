import { Check, X } from "lucide-react";

// Mirrors storepulse-backend/src/validators/auth.validator.js's
// passwordValidator exactly, so a green row here always means the backend
// will accept it too.
const REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { key: "upper", label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { key: "number", label: "At least one number", test: (pw) => /[0-9]/.test(pw) },
  {
    key: "special",
    label: "At least one special character",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export default function PasswordRequirements({ password, visible = true }) {
  if (!visible) return null;

  return (
    <ul
      className="grid"
      style={{ gap: "var(--space-1)", listStyle: "none", padding: 0, margin: 0 }}
    >
      {REQUIREMENTS.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li
            key={key}
            className="flex items-center text-xs"
            style={{ gap: "var(--space-1)", color: met ? "var(--moss)" : "var(--muted)" }}
          >
            {met ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5" style={{ color: "var(--brick)" }} aria-hidden="true" />
            )}
            {label}
          </li>
        );
      })}
    </ul>
  );
}
