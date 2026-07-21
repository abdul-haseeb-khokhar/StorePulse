import { ComposedChart, Bar, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../ui/Card";
import { useTheme } from "../../context/ThemeContext";

// Resolved from --stamp / a soft tint of it in index.css — hardcoded
// rather than var(...) to avoid relying on CSS custom property
// resolution inside SVG presentation attributes. Kept as a light/dark
// pair for the same reason the toggle exists: recharts can't pick up
// the [data-theme] swap on its own.
const PALETTES = {
  light: { clicks: "#93a8ce", views: "#2f4b7c", axis: "#8a8983", tooltipBorder: "#d8d8d3", cursor: "rgba(47, 75, 124, 0.06)" },
  dark: { clicks: "#3d4f6e", views: "#8fb2ec", axis: "#9c9b95", tooltipBorder: "#33353a", cursor: "rgba(143, 178, 236, 0.08)" },
};

/**
 * TrafficChart — bars = product clicks, line = page views, matching the
 * design's combo chart. `data` is [{ date, visitors, clicks }], same
 * shape the dashboard's analytics fetch already produces.
 */
export default function TrafficChart({ data }) {
  const { theme } = useTheme();
  const palette = PALETTES[theme];

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
              tick={{ fontSize: 11, fill: palette.axis }}
              interval={Math.ceil(data.length / 6)}
            />
            <Tooltip
              cursor={{ fill: palette.cursor }}
              contentStyle={{
                borderRadius: 0,
                border: `1px solid ${palette.tooltipBorder}`,
                background: "var(--paper-card)",
                color: "var(--ink)",
                fontFamily: "IBM Plex Sans, system-ui, sans-serif",
                fontSize: 12,
              }}
            />
            <Bar dataKey="clicks" name="Product clicks" fill={palette.clicks} />
            <Line
              type="monotone"
              dataKey="visitors"
              name="Page views"
              stroke={palette.views}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex" style={{ gap: "var(--space-4)", marginTop: "var(--space-3)", fontSize: 12 }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, background: palette.views, display: "inline-block" }} />
          Page views
        </span>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, background: palette.clicks, display: "inline-block" }} />
          Product clicks
        </span>
      </div>
    </Card>
  );
}
