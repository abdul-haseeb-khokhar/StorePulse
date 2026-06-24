import Card from "../ui/Card";

const trendStyles = {
  up: "bg-secondary-container text-on-secondary-container",
  down: "bg-error-container text-on-error-container",
};

/**
 * StatCard — one of the three top tiles on the dashboard (page views,
 * product clicks, unique visitors). `icon` and `trend` are passed in
 * so this single component covers all three without duplication.
 */
export default function StatCard({ icon, label, value, trend, trendDirection = "up" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg
          bg-primary-container/15 text-primary">
          {icon}
        </span>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${trendStyles[trendDirection]}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-bold text-on-surface">{value}</p>
    </Card>
  );
}
