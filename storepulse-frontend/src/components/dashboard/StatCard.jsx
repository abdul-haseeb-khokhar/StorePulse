import Card from "../ui/Card";
import Tag from "../ui/Tag";

const tagVariant = { up: "positive", down: "negative", flat: "neutral" };

/**
 * StatCard — the signature element of the design: a stat tile torn off
 * a register tape (see .card-torn in index.css), with the number set
 * in the display mono face like a printed total and a small barcode
 * flourish in the corner. This is the one place the design spends its
 * boldness — every other card on the site stays plain.
 */
export default function StatCard({ label, value, trend, trendDirection = "up", rangeLabel }) {
  return (
    <Card elevation="sm" torn>
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
