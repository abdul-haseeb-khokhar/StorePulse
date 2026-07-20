import Card from "../ui/Card";
import Tag from "../ui/Tag";

const tagVariant = { up: "accent", down: "outline", flat: "neutral" };

/**
 * StatCard — one of the three top tiles on the dashboard. The design's
 * stat tiles are icon-less: just a kicker label, a large number, and a
 * change tag against the previous period.
 */
export default function StatCard({ label, value, trend, trendDirection = "up", rangeLabel }) {
  return (
    <Card elevation="sm">
      <div className="card-kicker">{label}</div>
      <div className="card-title" style={{ fontSize: 32 }}>
        {value}
      </div>
      <div className="card-meta">
        {trend && <Tag variant={tagVariant[trendDirection] || "neutral"}>{trend}</Tag>}
        <span>vs previous {rangeLabel}</span>
      </div>
    </Card>
  );
}
