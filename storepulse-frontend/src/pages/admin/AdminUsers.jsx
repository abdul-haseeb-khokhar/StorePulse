import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Tag from "../../components/ui/Tag";
import Seg from "../../components/ui/Seg";
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

const PLAN_TAG_VARIANT = {
  Free: "neutral",
  Pro: "accent",
  Business: "positive",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Banned", label: "Banned" },
  { value: "Deleted", label: "Deleted" },
];

const ACTION_COPY = {
  Active: (name) => `${name} will be able to log in as an active user.`,
  Banned: (name) => `${name} will immediately lose access to their account.`,
  Deleted: (name) => `${name}'s email will be anonymized and their account permanently locked. This can't be undone.`,
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // { user, status }
  const [actionError, setActionError] = useState(null);

  const params = { page, limit: 20, search: search || undefined, status: status || undefined };

  const usersQuery = useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/users", { params });
      return data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }) => adminApi.patch(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setPendingAction(null);
    },
    onError: (err) => setActionError(getApiErrorMessage(err, "Could not update this user's status.")),
  });

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleStatusFilterChange(value) {
    setPage(1);
    setStatus(value);
  }

  function openAction(user, nextStatus) {
    setActionError(null);
    setPendingAction({ user, status: nextStatus });
  }

  function confirmAction() {
    if (!pendingAction) return;
    setActionError(null);
    statusMutation.mutate({ userId: pendingAction.user.id, status: pendingAction.status });
  }

  const users = usersQuery.data?.users ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 1;
  const loading = usersQuery.isPending;
  const error = usersQuery.isError
    ? getApiErrorMessage(usersQuery.error, "Could not load users.")
    : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Users</h1>

        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "var(--space-3)", marginBottom: "var(--space-3)" }}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center"
            style={{ gap: "var(--space-2)" }}
          >
            <Field
              id="user-search"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <Seg
            name="status-filter"
            aria-label="Filter by status"
            value={status}
            onChange={handleStatusFilterChange}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>

        {loading ? (
          <Card>
            <Skeleton height={200} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : users.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No users found</div>
          </Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Link to={`/admin/users/${user.id}`}>{user.fullName}</Link>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Tag variant={STATUS_TAG_VARIANT[user.status] || "neutral"}>{user.status}</Tag>
                      </td>
                      <td>
                        <Tag variant={PLAN_TAG_VARIANT[user.plan] || "neutral"}>{user.plan}</Tag>
                      </td>
                      <td>{user.isEmailVerified ? "Yes" : "No"}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="flex items-center" style={{ gap: "var(--space-2)" }}>
                        {user.status !== "Active" && user.status !== "Deleted" && (
                          <Button size="sm" variant="secondary" onClick={() => openAction(user, "Active")}>
                            Activate
                          </Button>
                        )}
                        {user.status !== "Banned" && user.status !== "Deleted" && (
                          <Button size="sm" variant="danger" onClick={() => openAction(user, "Banned")}>
                            Ban
                          </Button>
                        )}
                        {user.status !== "Deleted" && (
                          <Button size="sm" variant="danger" onClick={() => openAction(user, "Deleted")}>
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {totalPages > 1 && (
          <div
            className="flex items-center justify-between"
            style={{ marginTop: "var(--space-3)" }}
          >
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

        <Dialog
          open={Boolean(pendingAction)}
          title={pendingAction ? `${pendingAction.status} this user?` : ""}
          onClose={() => setPendingAction(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setPendingAction(null)}>
                Cancel
              </Button>
              <Button
                variant={pendingAction?.status === "Active" ? "primary" : "danger"}
                onClick={confirmAction}
                loading={statusMutation.isPending}
              >
                Confirm
              </Button>
            </>
          }
        >
          {pendingAction && (
            <>
              <p style={{ marginBottom: "var(--space-2)" }}>
                {ACTION_COPY[pendingAction.status](pendingAction.user.fullName)}
              </p>
              {actionError && <p style={{ color: "var(--brick)" }}>{actionError}</p>}
            </>
          )}
        </Dialog>
      </main>
    </AdminLayout>
  );
}
