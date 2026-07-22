import { Link } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import CodeBlock from "../components/ui/CodeBlock";
import SiteFooter from "../components/ui/SiteFooter";
import { API_BASE_URL } from "../lib/api";

const SNIPPET = `<script src="${API_BASE_URL}/track.js"\n  data-site-key="YOUR_SITE_KEY"></script>`;

const FEATURES = [
  {
    kicker: "Traffic",
    title: "Daily visitors & trend",
    body: "A day-by-day read on page views and unique visitors, with the period-over-period change built in.",
  },
  {
    kicker: "Product clicks",
    title: "What shoppers touch",
    body: "Tag any element with a product id and see which products get clicked most, ranked automatically.",
  },
  {
    kicker: "Multi-site",
    title: "Every store, one place",
    body: "Add as many storefronts as you run. Switch between them from the same dashboard, each with its own key.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Nav
        links={[
          { to: "/", label: "Overview", end: true },
          { to: "/login", label: "Log in" },
        ]}
        actions={
          <Link to="/signup">
            <Button>Get started</Button>
          </Link>
        }
      />

      <div className="mx-auto grid" style={{ maxWidth: 1040, gap: "var(--space-4)", padding: "var(--space-8) var(--space-4) var(--space-6)" }}>
        <Tag variant="outline" className="w-fit whitespace-nowrap">
          Traffic monitoring for ecommerce
        </Tag>
        <h1 style={{ fontSize: "clamp(32px, 9vw, 56px)", lineHeight: 1.02, margin: 0 }}>
          See exactly how shoppers move through your store
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: "56ch", opacity: 0.8, margin: 0 }}>
          Drop one script tag on your storefront. StorePulse tracks page views and
          product clicks in real time and gives you a clean dashboard per site — no
          cookies banner, no bloated suite.
        </p>
        <div className="flex" style={{ gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <Link to="/signup">
            <Button>Start tracking free</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">I already have an account</Button>
          </Link>
        </div>
      </div>

      <div
        className="mx-auto"
        style={{
          maxWidth: 1040,
          padding: "var(--space-6) var(--space-4)",
          borderTop: "1px solid var(--divider)",
          borderBottom: "1px solid var(--divider)",
        }}
      >
        <Tag variant="outline" className="w-fit" style={{ marginBottom: "var(--space-3)" }}>
          Why StorePulse
        </Tag>
        <h2 style={{ maxWidth: "20ch", marginBottom: "var(--space-3)" }}>
          You can&apos;t improve what you can&apos;t see.
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: "62ch", opacity: 0.8, margin: 0 }}>
          StorePulse shows store owners exactly how visitors interact with their
          site — what gets clicked, what gets ignored, and where sales opportunities
          are slipping away — so decisions are based on real behavior, not guesswork.
        </p>
      </div>

      <div className="mx-auto" style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) 0" }}>
        <h2 style={{ margin: 0 }}>This is what StorePulse provides</h2>
      </div>

      <div
        className="mx-auto grid grid-cols-1 sm:grid-cols-3"
        style={{ maxWidth: 1040, padding: "var(--space-3) var(--space-4) var(--space-6)", gap: "var(--space-3)" }}
      >
        {FEATURES.map((feature) => (
          <Card key={feature.kicker}>
            <div className="card-kicker">{feature.kicker}</div>
            <div className="card-title">{feature.title}</div>
            <p className="card-body">{feature.body}</p>
          </Card>
        ))}
      </div>

      <div className="mx-auto" style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}>
        <Card elevation="md">
          <div className="card-kicker">Setup</div>
          <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
            Live in one script tag
          </div>
          <p className="card-body">
            Register a site and you&apos;ll get a script key — drop it in before the
            closing &lt;/body&gt; tag and page views start reporting automatically
            from there, like this:
          </p>
          <CodeBlock>{SNIPPET}</CodeBlock>
          <p className="card-body" style={{ marginTop: "var(--space-3)" }}>
            Need a hand with integration? <a href="#contact">Contact us</a> and
            we&apos;ll walk you through it.
          </p>
          <p className="card-body">
            If you&apos;re a developer (or have one), here&apos;s the{" "}
            <Link to="/docs">complete integration guide →</Link>.
          </p>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
}
