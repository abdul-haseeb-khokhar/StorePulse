import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import api, { getApiErrorMessage } from "../lib/api";
import { clearSession } from "../lib/auth";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

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

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Profile</h1>

        {error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
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

        <Card>
          <div className="card-kicker">Session</div>
          <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
            Log out
          </div>
          <p className="card-body">You&apos;ll need to log in again to access your dashboard.</p>
          <Button variant="secondary" onClick={() => setConfirmLogoutOpen(true)}>
            Log out
          </Button>
        </Card>

        <Dialog
          open={confirmLogoutOpen}
          title="Log out?"
          onClose={() => setConfirmLogoutOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirmLogoutOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Log out
              </Button>
            </>
          }
        >
          You&apos;ll be signed out of StorePulse on this device.
        </Dialog>
      </main>
    </AppLayout>
  );
}
