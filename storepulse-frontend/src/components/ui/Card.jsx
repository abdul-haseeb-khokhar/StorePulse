const elevClass = { sm: "elev-sm", md: "elev-md", lg: "elev-lg" };

/**
 * Card — the plain paper-stock surface used for every content block
 * (forms, site tiles, snippets, tables, stat tiles).
 */
export default function Card({
  children,
  elevation,
  className = "",
  as: As = "div",
  ...props
}) {
  return (
    <As
      className={`card ${elevation ? elevClass[elevation] : ""} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}
