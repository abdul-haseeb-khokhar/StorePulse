const variantClass = {
  accent: "tag-accent",
  "accent-2": "tag-accent-2",
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
