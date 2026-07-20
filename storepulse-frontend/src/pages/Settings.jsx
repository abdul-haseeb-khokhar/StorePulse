import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
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
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Settings</h1>

        {error ? (
          <Card>
            <p className="card-body" style={{ color: "#b3261e" }}>
              {error}
            </p>
          </Card>
        ) : (
          <Card elevation="md">
            <div className="card-kicker">Account</div>
            <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
              {user?.fullName || "Loading…"}
            </div>
            <div className="grid" style={{ gap: "var(--space-3)" }}>
              <Field id="acc-name" label="Full name" value={user?.fullName || ""} readOnly />
              <Field id="acc-email" label="Email" value={user?.email || ""} readOnly />
            </div>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
