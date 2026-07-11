import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Card from "../components/ui/Card";
import api, { getApiErrorMessage } from "../lib/api";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const { data } = await api.get("/auth/me");
        if (!ignore) setUser(data.user);
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load account settings."));
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AppLayout>
      <Topbar />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        {error ? (
          <Card className="mt-6 p-6 text-sm text-error">{error}</Card>
        ) : (
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-bold text-on-surface">Account</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Full name
                </dt>
                <dd className="mt-1 text-sm font-semibold text-on-surface">
                  {user?.fullName || "Loading..."}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Email
                </dt>
                <dd className="mt-1 text-sm font-semibold text-on-surface">
                  {user?.email || "Loading..."}
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
