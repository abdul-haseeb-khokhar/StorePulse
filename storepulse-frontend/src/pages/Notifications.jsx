import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";

// Human-ish relative time ("3h ago") rather than a bare date — these are
// meant to be skimmed the way a notification feed usually is, and a full
// timestamp is one click away in the page itself if it's ever needed.
function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list({ page, limit: 20 }),
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { page, limit: 20 } });
      return data;
    },
  });

  // Both mutations invalidate the whole ["notifications"] prefix, not just
  // this page's own {page, limit} key — that also covers AppHeader's
  // {page: 1, limit: 1} unread-count query, so the bell badge updates
  // immediately instead of waiting out its own poll interval.
  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function openNotification(notification) {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  }

  const loading = notificationsQuery.isPending;
  const error = notificationsQuery.isError
    ? getApiErrorMessage(notificationsQuery.error, "Could not load notifications.")
    : null;
  const notifications = notificationsQuery.data?.notifications ?? [];
  const totalPages = notificationsQuery.data?.totalPages ?? 1;
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 720, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-4)" }}>
          <h1>Notifications</h1>
          <Button
            variant="secondary"
            size="sm"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            Mark all as read
          </Button>
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
        ) : notifications.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No notifications yet</div>
          </Card>
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--space-2)" }}>
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                as={notification.link ? "button" : "div"}
                onClick={notification.link ? () => openNotification(notification) : undefined}
                className="flex items-start justify-between gap-3 text-left w-full"
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: notification.read ? undefined : "var(--stamp-soft)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  {!notification.read && (
                    <span
                      className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                      style={{ background: "var(--stamp)" }}
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-sm" style={{ margin: 0 }}>
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                  {timeAgo(notification.createdAt)}
                </span>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ marginTop: "var(--space-3)" }}>
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
