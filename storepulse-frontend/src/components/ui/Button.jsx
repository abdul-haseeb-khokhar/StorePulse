const variantClasses = {
  primary:
    "bg-primary text-on-primary hover:bg-[#2c1ea8] focus-visible:outline-primary",
  secondary:
    "bg-surface-lowest text-on-surface border border-outline-variant hover:bg-surface-low focus-visible:outline-primary",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container focus-visible:outline-primary",
};

const sizeClasses = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

/**
 * Button — shared primitive used across every screen.
 * Keeping this as one component means a single change here
 * (color, radius, focus ring) propagates everywhere instantly.
 */
export default function Button({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  icon = null,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-colors duration-150 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
