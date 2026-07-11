import Card from "../ui/Card";

/**
 * RankedList — shared shell for "Top Clicked Products" and "Top
 * Referrers". Both panels are visually identical (icon/thumbnail,
 * title, subtitle, right-aligned number + label) so one component
 * renders both — only the `items` data differs.
 */
export default function RankedList({ title, items, icon, valueLabel }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        {icon}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-outline-variant/60 bg-surface-low px-4 py-8 text-center text-sm text-on-surface-variant">
          No data available yet.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full
                  bg-primary-container/15 text-primary">
                  {item.iconNode}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">{item.value}</p>
              <p className="text-xs text-on-surface-variant">{valueLabel}</p>
            </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
