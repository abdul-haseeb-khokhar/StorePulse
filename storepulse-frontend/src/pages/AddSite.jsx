import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";

function normalizeDomain(value) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

function titleFromDomain(domain) {
  return domain
    .split(".")[0]
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AddSite() {
  const navigate = useNavigate();
  const [siteName, setSiteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const domain = normalizeDomain(siteName);
      const { data } = await api.post("/sites", {
        name: titleFromDomain(domain),
        domain,
      });
      navigate(`/sites/${data.site.id}/setup`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the site. Try again."));
    } finally {
      setLoading(false);
    }
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
              label="Site name or domain"
              placeholder="mystore.com"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              icon={<Globe className="h-4 w-4" />}
              required
            />
            <p className="text-xs" style={{ opacity: 0.65, marginTop: "-6px" }}>
              We support Shopify, WooCommerce, Magento, and custom builds.
            </p>

            {error && (
              <p className="text-sm" style={{ color: "#b3261e" }}>
                {error}
              </p>
            )}

            <Button type="submit" block loading={loading}>
              Create site
            </Button>
          </form>
        </Card>
      </main>
    </AppLayout>
  );
}
