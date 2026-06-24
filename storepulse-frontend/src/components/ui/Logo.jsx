import { ChartNoAxesColumnIncreasing } from "lucide-react";

/**
 * Logo — icon + wordmark combo from the Stitch designs. Used standalone
 * on auth screens and inside the Sidebar on app screens. The tagline
 * is optional since auth screens omit it.
 */
export default function Logo({ tagline = null, size = "md" }) {
  const isLarge = size === "lg";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center rounded-lg bg-primary text-on-primary
          ${isLarge ? "h-10 w-10" : "h-9 w-9"}`}
      >
        <ChartNoAxesColumnIncreasing className={isLarge ? "h-5 w-5" : "h-4.5 w-4.5"} />
      </span>
      <div className="text-left">
        <p
          className={`font-bold leading-tight text-on-surface ${
            isLarge ? "text-xl" : "text-lg"
          }`}
        >
          StorePulse
        </p>
        {tagline && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
