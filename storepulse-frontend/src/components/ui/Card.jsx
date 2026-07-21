const elevClass = { sm: "elev-sm", md: "elev-md", lg: "elev-lg" };

/**
 * Card — the plain paper-stock surface used for every content block
 * (forms, site tiles, snippets, tables). `torn` opts into the jagged
 * register-tape edge — reserved for StatCard, the one signature
 * element; every other card stays plain by default.
 */
export default function Card({
  children,
  elevation,
  torn = false,
  className = "",
  as: As = "div",
  ...props
}) {
  return (
    <As
      className={`card ${torn ? "card-torn" : ""} ${elevation ? elevClass[elevation] : ""} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}
