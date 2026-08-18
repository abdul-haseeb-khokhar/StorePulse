/**
 * Tag — small pill label with a fixed set of color variants, plus Eyebrow,
 * the small kicker-badge style used above section headings.
 */
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

export function Eyebrow({ children, className = "" }) {
  return (
    <div className={`mb-2.5 flex items-center gap-2 ${className}`}>
      <span className="h-2 w-5 rounded-full bg-[#DDBB55] inline-block shrink-0" aria-hidden="true" />
      <span className="font-sora text-xs font-semibold tracking-widest uppercase text-[var(--ink)]">
        {children}
      </span>
    </div>
  );
}
