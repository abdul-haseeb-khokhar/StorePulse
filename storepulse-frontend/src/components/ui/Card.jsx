const elevClass = { sm: "elev-sm", md: "elev-md", lg: "elev-lg", xl: "shadow-xl" };

/**
 * Card — the plain paper-stock surface used for every content block
 * (forms, site tiles, snippets, tables, stat tiles).
 */
export default function Card({
  children,
  elevation,
  interactive = false,
  className = "",
  as: As = "div",
  ...props
}) {
  return (
    <As
      className={`card ${interactive ? "hover:-translate-y-1 hover:shadow-xl cursor-pointer transition-all duration-300" : ""} ${elevation ? elevClass[elevation] || elevation : ""} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

