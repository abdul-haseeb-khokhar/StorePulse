import Corners from "./Corners";

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

/**
 * Button — primary/secondary render the blueprint frame (border +
 * corner marks); ghost never does, matching the design (e.g. "Log out",
 * "I already have an account" are plain, unframed).
 */
export default function Button({
  children,
  variant = "primary",
  block = false,
  type = "button",
  disabled = false,
  loading = false,
  icon = null,
  className = "",
  ...props
}) {
  const framed = variant === "primary" || variant === "secondary";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass[variant]} ${block ? "btn-block" : ""} ${
        framed ? "blueprint" : ""
      } ${className}`}
      {...props}
    >
      {framed && <Corners />}
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
