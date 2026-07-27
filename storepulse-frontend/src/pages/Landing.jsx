import { Link } from "react-router-dom";
import Nav from "../components/ui/Nav";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import HeroAnimation from "../components/ui/HeroAnimation";
import SiteFooter from "../components/ui/SiteFooter";

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
        <h1 className="landing-hero-heading" style={{ lineHeight: 1.02, margin: 0 }}>
          See exactly how shoppers move through your store
        </h1>

        <HeroAnimation />

        <div className="flex landing-hero-cta" style={{ gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
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
        style={{ maxWidth: 1040, padding: "var(--space-3) var(--space-4) var(--space-8)", gap: "var(--space-3)" }}
      >
        {FEATURES.map((feature) => (
          <Card key={feature.kicker}>
            <div className="card-kicker">{feature.kicker}</div>
            <div className="card-title">{feature.title}</div>
            <p className="card-body">{feature.body}</p>
          </Card>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
