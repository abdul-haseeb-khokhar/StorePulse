import { AlertCircle } from "lucide-react";

/**
 * Field — label + .input pair. Preserves icon / rightAction adornments
 * while enforcing NYRON field label hierarchy and error alert formatting.
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
  required = false,
  optional = false,
  className = "",
  ...props
}) {
  const hasAdorn = icon || rightAction;

  return (
    <div className={`field flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="font-sora text-xs font-semibold text-[var(--ink)] flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-[var(--brick)] ml-0.5">*</span>}
          </span>
          {optional && <span className="font-normal text-[11px] text-[var(--muted)]">(Optional)</span>}
        </label>
      )}
      <div className={hasAdorn ? "relative" : undefined}>
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input ${icon ? "input-adorn-left" : ""} ${rightAction ? "input-adorn-right" : ""} ${error ? "border-[var(--brick)] bg-[var(--brick-soft)]/20" : ""}`}
          {...props}
        />
        {rightAction && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">{rightAction}</span>
        )}
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--brick)] font-sora">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

