import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/useTheme";

/**
 * ThemeToggle — sliding track + knob switch with #FEBA2F and #000C1A colors.
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
          <Moon className="h-3.5 w-3.5 text-[#000C1A] fill-[#000C1A]" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-[#DDBB55]" />
        )}
      </span>
    </button>
  );
}

