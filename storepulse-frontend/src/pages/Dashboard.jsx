import { Eye, MousePointerClick, Users, ChevronDown, MoreHorizontal, Filter } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import TrafficChart from "../components/dashboard/TrafficChart";
import RankedList from "../components/dashboard/RankedList";

// TODO: replace every block below with real data once the analytics
// module's endpoints exist:
//   GET /api/analytics/summary        -> stats
//   GET /api/analytics/traffic        -> chartData
//   GET /api/analytics/top-products   -> topProducts
//   GET /api/analytics/top-referrers  -> topReferrers
const stats = [
  { label: "Total page views", value: "124,802", trend: "+12.5%", trendDirection: "up", icon: <Eye className="h-5 w-5" /> },
  { label: "Total product clicks", value: "45,210", trend: "+8.2%", trendDirection: "up", icon: <MousePointerClick className="h-5 w-5" /> },
  { label: "Unique visitors", value: "18,349", trend: "-2.4%", trendDirection: "down", icon: <Users className="h-5 w-5" /> },
];

const chartData = [
  { date: "Oct 1", visitors: 320, clicks: 180 },
  { date: "Oct 3", visitors: 480, clicks: 220 },
  { date: "Oct 5", visitors: 410, clicks: 200 },
  { date: "Oct 8", visitors: 610, clicks: 260 },
  { date: "Oct 10", visitors: 540, clicks: 240 },
  { date: "Oct 12", visitors: 700, clicks: 310 },
  { date: "Oct 15", visitors: 590, clicks: 270 },
  { date: "Oct 18", visitors: 430, clicks: 210 },
  { date: "Oct 20", visitors: 520, clicks: 230 },
  { date: "Oct 22", visitors: 660, clicks: 290 },
  { date: "Oct 25", visitors: 480, clicks: 220 },
  { date: "Oct 27", visitors: 390, clicks: 190 },
  { date: "Oct 30", visitors: 610, clicks: 260 },
];

const topProducts = [
  { id: "1", name: "Hand-Stitched Leather Wallet", subtitle: "Leather Goods", value: "4,210" },
  { id: "2", name: "Ceramic Wavy Vase", subtitle: "Home Decor", value: "3,892" },
  { id: "3", name: "Organic Cotton Linens", subtitle: "Bedroom", value: "2,405" },
];

const topReferrers = [
  { id: "1", name: "Google Search", subtitle: "Organic Traffic", value: "12,405" },
  { id: "2", name: "Instagram", subtitle: "Social Media", value: "8,322" },
  { id: "3", name: "Weekly Newsletter", subtitle: "Email Marketing", value: "5,110" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <Topbar>
        <button
          type="button"
          className="flex items-center gap-1.5 text-lg font-bold text-on-surface"
        >
          The Artisan Shop
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </button>
      </Topbar>

      <main className="flex-1 px-6 py-6">
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="md">
            Last 30 days
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button size="md">Switch Site</Button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-5">
          <TrafficChart data={chartData} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RankedList
            title="Top Clicked Products"
            items={topProducts}
            valueLabel="clicks"
            icon={
              <button type="button" aria-label="More options" className="text-on-surface-variant">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          />
          <RankedList
            title="Top Referrers"
            items={topReferrers}
            valueLabel="visits"
            icon={
              <button type="button" aria-label="Filter" className="text-on-surface-variant">
                <Filter className="h-4 w-4" />
              </button>
            }
          />
        </div>
      </main>
    </AppLayout>
  );
}
