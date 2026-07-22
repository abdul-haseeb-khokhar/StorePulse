/**
 * CodeBlock — the monospace snippet box used for install scripts and
 * payload examples. Pulled out once it started appearing in the
 * per-site tracking snippet, the landing page teaser, and the full
 * docs page, all with the same styling.
 */
export default function CodeBlock({ children, className = "" }) {
  return (
    <pre
      className={className}
      style={{
        fontFamily: "ui-monospace,SF Mono,Menlo,monospace",
        fontSize: 13,
        lineHeight: 1.6,
        background: "var(--paper)",
        border: "1px solid var(--divider)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-3)",
        overflowX: "auto",
        margin: 0,
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}
