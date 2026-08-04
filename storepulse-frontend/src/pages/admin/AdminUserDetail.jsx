import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Tag from "../../components/ui/Tag";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

const STATUS_TAG_VARIANT = {
  Active: "positive",
  Inactive: "neutral",
  Banned: "negative",
  Deleted: "outline",
};

const ACTION_COPY = {
  Active: (name) => `${name} will be able to log in as an active user.`,
  Banned: (name) => `${name} will immediately lose access to their account.`,
  Deleted: (name) => `${name}'s email will be anonymized and their account permanently locked. This can't be undone.`,
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [actionError, setActionError] = useState(null);

  const userQuery = useQuery({
    queryKey: queryKeys.admin.users.detail(id),
    queryFn: async () => {
      const { data } = await adminApi.get(`/admin/users/${id}`);
      return data.user;
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => adminApi.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setPendingStatus(null);
    },
    onError: (err) => setActionError(getApiErrorMessage(err, "Could not update this user's status.")),
  });

  const user = userQuery.data;
  const loading = userQuery.isPending;
  const error = userQuery.isError
    ? getApiErrorMessage(userQuery.error, "Could not load this user.")
    : null;

  function openAction(nextStatus) {
    setActionError(null);
    setPendingStatus(nextStatus);
  }

  function confirmAction() {
    if (!pendingStatus) return;
    setActionError(null);
    statusMutation.mutate(pendingStatus);
  }

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 720, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link
          to="/admin/users"
          className="flex items-center text-sm"
          style={{ gap: 6, marginBottom: "var(--space-3)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>

        {loading ? (
          <Card>
            <Skeleton height={160} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">{user.email}</div>
              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
              >
                <div className="card-title" style={{ margin: 0 }}>
                  {user.fullName}
                </div>
                <Tag variant={STATUS_TAG_VARIANT[user.status] || "neutral"}>{user.status}</Tag>
              </div>
              <p className="card-body">
                {user.isEmailVerified ? "Email verified" : "Email not verified"} · Joined{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>

              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginTop: "var(--space-3)" }}
              >
                {user.status !== "Active" && user.status !== "Deleted" && (
                  <Button variant="secondary" onClick={() => openAction("Active")}>
                    Activate
                  </Button>
                )}
                {user.status !== "Banned" && user.status !== "Deleted" && (
                  <Button variant="danger" onClick={() => openAction("Banned")}>
                    Ban
                  </Button>
                )}
                {user.status !== "Deleted" && (
                  <Button variant="danger" onClick={() => openAction("Deleted")}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>

            <Card>
              <div className="card-kicker">Sites</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                {user.sites.length} connected site{user.sites.length === 1 ? "" : "s"}
              </div>
              {user.sites.length === 0 ? (
                <p className="card-body" style={{ opacity: 0.6 }}>
                  No sites yet.
                </p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Domain</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.sites.map((site) => (
                      <tr key={site.id}>
                        <td>{site.name}</td>
                        <td>{site.domain}</td>
                        <td>{new Date(site.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}

        <Dialog
          open={Boolean(pendingStatus)}
          title={pendingStatus ? `${pendingStatus} this user?` : ""}
          onClose={() => setPendingStatus(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setPendingStatus(null)}>
                Cancel
              </Button>
              <Button
                variant={pendingStatus === "Active" ? "primary" : "danger"}
                onClick={confirmAction}
                loading={statusMutation.isPending}
              >
                Confirm
              </Button>
            </>
          }
        >
          {pendingStatus && user && (
            <p style={{ marginBottom: "var(--space-2)" }}>
              {ACTION_COPY[pendingStatus](user.fullName)}
            </p>
          )}
          {actionError && <p style={{ color: "var(--brick)" }}>{actionError}</p>}
        </Dialog>
      </main>
    </AdminLayout>
  );
}
