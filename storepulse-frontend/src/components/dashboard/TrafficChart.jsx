import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Card from "../ui/Card";

/**
 * TrafficChart — the bar chart in the middle of the dashboard.
 * `data` is an array of { date, visitors, clicks } so this component
 * stays dumb and reusable once real ingest/analytics data lands —
 * the page just needs to fetch and shape data into this format.
 */
export default function TrafficChart({ data }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Traffic Overview</h2>
          <p className="text-sm text-on-surface-variant">
            Daily visitors vs product engagement across 30 days.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Visitors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-container/40" /> Clicks
          </span>
        </div>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#777587" }}
              interval={Math.ceil(data.length / 5)}
            />
            <Tooltip
              cursor={{ fill: "rgba(53, 37, 205, 0.05)" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #c7c4d8", fontSize: 13 }}
            />
            <Bar dataKey="visitors" fill="#3525cd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="clicks" fill="#c3c0ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
