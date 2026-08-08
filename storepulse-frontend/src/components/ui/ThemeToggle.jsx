import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/useTheme";

/**
 * ThemeToggle — sliding track + knob switch, matching NYRON's Theme
 * Toggle component spec: a pill-shaped track with a circular knob that
 * physically travels from one side to the other, carrying the icon
 * with it — sun riding in the knob for light mode, moon for dark —
 * rather than one fixed glyph just recoloring in place.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className="theme-toggle-knob"
        style={{ transform: isDark ? "translateX(24px)" : "translateX(0)" }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" style={{ color: "var(--ink)" }} fill="var(--ink)" />
        ) : (
          <Sun className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
        )}
      </span>
    </button>
  );
}
