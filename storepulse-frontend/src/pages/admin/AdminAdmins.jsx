/**
 * AdminAdmins — superadmin-only view of every admin account (active and
 * pending), with an invite-by-email dialog.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Tag from "../../components/ui/Tag";
import Dialog from "../../components/ui/Dialog";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage, getFieldErrors } from "../../lib/api";
import { getStoredAdmin } from "../../lib/adminAuth";
import { queryKeys } from "../../lib/queryKeys";

export default function AdminAdmins() {
  const queryClient = useQueryClient();
  const isSuperAdmin = getStoredAdmin()?.role === "SUPERADMIN";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [inviteError, setInviteError] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);

  const adminsQuery = useQuery({
    queryKey: queryKeys.admin.admins,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/auth/admins");
      return data.admins;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (email) => adminApi.post("/admin/auth/invite", { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins });
      setInviteSent(true);
    },
    onError: (err) => {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setInviteError(getApiErrorMessage(err, "Could not send the invite."));
      }
    },
  });

  function openInvite() {
    setEmail("");
    setFieldErrors({});
    setInviteError(null);
    setInviteSent(false);
    setInviteOpen(true);
  }

  function handleInviteSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setInviteError(null);
    inviteMutation.mutate(email);
  }

  const admins = adminsQuery.data ?? [];
  const loading = adminsQuery.isPending;
  const error = adminsQuery.isError
    ? getApiErrorMessage(adminsQuery.error, "Could not load admins.")
    : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 840, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--space-4)" }}>
          <h1 style={{ margin: 0 }}>Admins</h1>
          {isSuperAdmin && <Button onClick={openInvite}>Invite admin</Button>}
        </div>

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
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Invited</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.fullName || "—"}</td>
                      <td>{admin.email}</td>
                      <td>
                        <Tag variant={admin.role === "SUPERADMIN" ? "accent" : "neutral"}>
                          {admin.role}
                        </Tag>
                      </td>
                      <td>
                        <Tag variant={admin.isActive ? "positive" : "outline"}>
                          {admin.isActive ? "Active" : "Pending"}
                        </Tag>
                      </td>
                      <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Dialog
          open={inviteOpen}
          title="Invite a new admin"
          onClose={() => setInviteOpen(false)}
          actions={
            inviteSent ? (
              <Button onClick={() => setInviteOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteSubmit} loading={inviteMutation.isPending}>
                  Send invite
                </Button>
              </>
            )
          }
        >
          {inviteSent ? (
            <p style={{ color: "var(--stamp)" }}>Invite sent to {email}.</p>
          ) : (
            <form onSubmit={handleInviteSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
              <Field
                id="invite-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                required
              />
              {inviteError && <p style={{ color: "var(--brick)" }}>{inviteError}</p>}
            </form>
          )}
        </Dialog>
      </main>
    </AdminLayout>
  );
}
