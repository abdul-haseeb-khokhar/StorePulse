const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

// Base .btn in index.css is the "medium" size; sm/lg opt into the other
// two tiers of the button-size scale.
const sizeClass = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  type = "button",
  disabled = false,
  loading = false,
  icon = null,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${block ? "btn-block" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
