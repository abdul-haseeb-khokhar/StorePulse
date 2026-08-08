import Card from "../ui/Card";
import Tag from "../ui/Tag";

const tagVariant = { up: "positive", down: "negative", flat: "neutral" };

/**
 * StatCard — the number set in the display mono face like a printed
 * total, with a small barcode flourish in the corner.
 */
export default function StatCard({ label, value, trend, trendDirection = "up", rangeLabel }) {
  return (
    <Card elevation="sm">
      <div className="flex items-start justify-between">
        <div className="card-kicker">{label}</div>
        <span className="barcode" aria-hidden="true" />
      </div>
      <div className="num" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
      <div className="card-meta">
        {trend && <Tag variant={tagVariant[trendDirection] || "neutral"}>{trend}</Tag>}
        <span>vs previous {rangeLabel}</span>
      </div>
    </Card>
  );
}
