import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

export default function AdminSites() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const params = { page, limit: 20, search: search || undefined };

  const sitesQuery = useQuery({
    queryKey: queryKeys.admin.sites.list(params),
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/sites", { params });
      return data;
    },
  });

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const sites = sitesQuery.data?.sites ?? [];
  const totalPages = sitesQuery.data?.totalPages ?? 1;
  const loading = sitesQuery.isPending;
  const error = sitesQuery.isError
    ? getApiErrorMessage(sitesQuery.error, "Could not load sites.")
    : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Sites</h1>

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center"
          style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
        >
          <Field
            id="site-search"
            placeholder="Search by name or domain"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

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
        ) : sites.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No sites found</div>
          </Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Domain</th>
                    <th>Owner</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id}>
                      <td>{site.name}</td>
                      <td>{site.domain}</td>
                      <td>
                        <Link to={`/admin/users/${site.user.id}`}>{site.user.fullName}</Link>
                      </td>
                      <td>{new Date(site.createdAt).toLocaleDateString()}</td>
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
      </main>
    </AdminLayout>
  );
}
