import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Card from "../components/ui/Card";

/**
 * Settings — placeholder page. The sidebar links here but none of
 * your six Stitch exports covered this screen, so this is a minimal
 * stand-in to keep the route from 404ing. Swap in a real design
 * whenever you get to it.
 */
export default function Settings() {
  return (
    <AppLayout>
      <Topbar />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <Card className="mt-6 p-6 text-sm text-on-surface-variant">
          Settings screen not yet designed in Stitch — placeholder for now.
        </Card>
      </main>
    </AppLayout>
  );
}
