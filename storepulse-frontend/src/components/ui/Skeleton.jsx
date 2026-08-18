/**
 * Skeleton — a single shimmering placeholder block, the building block for
 * DashboardSkeleton and other loading states.
 */
export default function Skeleton({ width = "100%", height = 14, style = {}, className = "" }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
