/**
 * Loading placeholder for the dashboard page: mirrors the real layout
 * (header, stat cards, traffic chart, two table cards) so content doesn't
 * jump around once the real data arrives.
 */
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function HeaderSkeleton() {
  return (
    <div
      className="flex flex-wrap items-end justify-between"
      style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}
    >
      <div>
        <Skeleton width={80} height={16} style={{ marginBottom: "var(--space-2)" }} />
        <Skeleton width={180} height={28} />
      </div>
      <div className="flex items-center" style={{ gap: "var(--space-3)" }}>
        <Skeleton width={140} height={36} />
        <Skeleton width={110} height={36} />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card elevation="sm">
      <Skeleton width={70} height={10} />
      <Skeleton width={90} height={32} style={{ marginBlock: 4 }} />
      <Skeleton width={120} height={12} />
    </Card>
  );
}

function TableCardSkeleton() {
  return (
    <Card>
      <Skeleton width={60} height={10} style={{ marginBottom: "var(--space-2)" }} />
      <Skeleton width={140} height={18} style={{ marginBottom: "var(--space-3)" }} />
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex items-center justify-between"
          style={{ padding: "8px 0" }}
        >
          <Skeleton width="55%" height={12} />
          <Skeleton width={40} height={12} />
        </div>
      ))}
    </Card>
  );
}

export default function DashboardSkeleton({ showHeader = false }) {
  return (
    <>
      {showHeader && <HeaderSkeleton />}

      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}
      >
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <Card elevation="md" style={{ marginBottom: "var(--space-4)" }}>
        <Skeleton width={60} height={10} style={{ marginBottom: "var(--space-2)" }} />
        <Skeleton width={220} height={18} style={{ marginBottom: "var(--space-3)" }} />
        <Skeleton height={220} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--space-3)" }}>
        <TableCardSkeleton />
        <TableCardSkeleton />
      </div>
    </>
  );
}
