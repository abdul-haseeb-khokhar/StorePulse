/**
 * The raw theme context object. Split from ThemeContext.jsx so useTheme.js
 * can import just the context without pulling in the provider component.
 */
import { createContext } from "react";

export const ThemeContext = createContext(null);
