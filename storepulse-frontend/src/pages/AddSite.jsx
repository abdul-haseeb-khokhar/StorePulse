import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Card from "../components/ui/Card";
import TextField from "../components/ui/TextField";
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
      <Topbar />
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-bold text-on-surface">Add a new site</h1>
          <p className="mt-2 text-on-surface-variant">
            Connect your store to start tracking events and optimizing conversions.
          </p>
        </div>

        <Card className="mt-8 w-full max-w-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              id="siteName"
              label="Site name or domain"
              placeholder="e.g., myshopify.com"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              icon={<Globe className="h-4 w-4" />}
              required
            />
            <p className="-mt-2 text-xs text-on-surface-variant">
              We support Shopify, WooCommerce, Magento, and custom builds.
            </p>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>
              Create site
            </Button>
          </form>
        </Card>
      </main>
    </AppLayout>
  );
}
