/**
 * Field — label + .input pair. Keeps the icon / rightAction adornment
 * slots from the old TextField (used for the password-visibility
 * toggle) since that's a working affordance worth preserving even
 * though the static mockup doesn't show one.
 */
export default function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon = null,
  rightAction = null,
  error = null,
  className = "",
  ...props
}) {
  const hasAdorn = icon || rightAction;

  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={hasAdorn ? "relative" : undefined}>
        {icon && (
          <span className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input ${icon ? "input-adorn-left" : ""} ${rightAction ? "input-adorn-right" : ""}`}
          {...props}
        />
        {rightAction && (
          <span className="absolute right-[10px] top-1/2 -translate-y-1/2">{rightAction}</span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--brick)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
