/**
 * TextField — label + input pair matching the Stitch field style:
 * rounded border, subtle surface background, icon slot on the left,
 * optional action button on the right (used for password visibility).
 */
export default function TextField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon = null,
  rightAction = null,
  error = null,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-on-surface"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-surface-low px-3.5
          focus-within:border-primary focus-within:ring-1 focus-within:ring-primary
          ${error ? "border-error" : "border-outline-variant"}`}
      >
        {icon && <span className="text-on-surface-variant">{icon}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent py-2.5 text-sm text-on-surface placeholder:text-outline
            outline-none"
          {...props}
        />
        {rightAction && <span>{rightAction}</span>}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
