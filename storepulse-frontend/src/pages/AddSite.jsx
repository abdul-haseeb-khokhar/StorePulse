/**
 * AddSite — form for registering a new site under the logged-in user's
 * account. On success, seeds the new site into the query cache and routes
 * straight to its setup page (which shows the tracking snippet/API key).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, Globe } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";

function normalizeDomain(value) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

export default function AddSite() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const createSiteMutation = useMutation({
    mutationFn: (payload) => api.post("/sites", payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      queryClient.setQueryData(queryKeys.sites.detail(data.site.id), data.site);
      navigate(`/sites/${data.site.id}/setup`);
    },
    onError: (err) => {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(getApiErrorMessage(err, "Could not create the site. Try again."));
      }
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    createSiteMutation.mutate({ name: name.trim(), domain: normalizeDomain(domain) });
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 640, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Add a site</h1>

        <Card elevation="md">
          <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-3)" }}>
            <Field
              id="siteName"
              label="Site name"
              placeholder="My Store"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Store className="h-4 w-4" />}
              error={fieldErrors.name}
              required
            />
            <Field
              id="siteDomain"
              label="Domain"
              placeholder="mystore.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              icon={<Globe className="h-4 w-4" />}
              error={fieldErrors.domain}
              required
            />

            {error && (
              <p className="text-sm" style={{ color: "var(--brick)" }}>
                {error}
              </p>
            )}

            <Button type="submit" block loading={createSiteMutation.isPending}>
              Create site
            </Button>
          </form>
        </Card>
      </main>
    </AppLayout>
  );
}
