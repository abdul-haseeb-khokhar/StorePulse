/**
 * Card — the white rounded panel used everywhere: auth forms, stat
 * tiles, dashboard sections, site rows. One component so border-radius,
 * border, and shadow stay identical across the whole app.
 */
export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/40 bg-surface-lowest
        shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
