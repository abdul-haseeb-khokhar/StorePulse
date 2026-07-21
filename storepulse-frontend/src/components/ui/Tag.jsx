const variantClass = {
  accent: "tag-accent",
  positive: "tag-positive",
  negative: "tag-negative",
  outline: "tag-outline",
  neutral: "tag-neutral",
};

export default function Tag({ children, variant = "neutral", className = "", ...props }) {
  return (
    <span className={`tag ${variantClass[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
