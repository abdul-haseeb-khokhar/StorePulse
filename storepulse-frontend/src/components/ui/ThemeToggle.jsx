import { Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeToggle — single moon glyph shared by every Nav instance. Outline
 * and muted in light mode (inactive), solid and gold in dark mode (lit) —
 * the color swap doubles as the state indicator, no separate sun icon.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Moon
        className="h-4 w-4"
        color={isDark ? "var(--gold)" : "var(--muted)"}
        fill={isDark ? "var(--gold)" : "none"}
      />
    </button>
  );
}
