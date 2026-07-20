import { ComposedChart, Bar, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../ui/Card";

// Resolved from --color-accent-300 / --color-accent-700 in index.css —
// hardcoded rather than var(...) to avoid relying on CSS custom
// property resolution inside SVG presentation attributes.
const CLICKS_COLOR = "#b5d9fd";
const VIEWS_COLOR = "#416180";
const AXIS_COLOR = "#7a7a7d";

/**
 * TrafficChart — bars = product clicks, line = page views, matching the
 * design's combo chart. `data` is [{ date, visitors, clicks }], same
 * shape the dashboard's analytics fetch already produces.
 */
export default function TrafficChart({ data }) {
  return (
    <Card elevation="md">
      <div className="card-kicker">Traffic</div>
      <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
        Page views &amp; product clicks
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barGap={4} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              interval={Math.ceil(data.length / 6)}
            />
            <Tooltip
              cursor={{ fill: "rgba(65, 97, 128, 0.06)" }}
              contentStyle={{ borderRadius: 0, border: "1px solid #d4d4d7", fontSize: 12 }}
            />
            <Bar dataKey="clicks" name="Product clicks" fill={CLICKS_COLOR} />
            <Line
              type="monotone"
              dataKey="visitors"
              name="Page views"
              stroke={VIEWS_COLOR}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex" style={{ gap: "var(--space-4)", marginTop: "var(--space-3)", fontSize: 12 }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, background: VIEWS_COLOR, display: "inline-block" }} />
          Page views
        </span>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, background: CLICKS_COLOR, display: "inline-block" }} />
          Product clicks
        </span>
      </div>
    </Card>
  );
}
