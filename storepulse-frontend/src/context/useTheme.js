/**
 * Hook for reading/toggling the current theme. Must be used under ThemeProvider.
 */
import { useContext } from "react";
import { ThemeContext } from "./theme-context";

export function useTheme() {
  return useContext(ThemeContext);
}
