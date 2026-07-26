import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CodeBlock from "../components/ui/CodeBlock";
import SiteFooter from "../components/ui/SiteFooter";
import ThemeToggle from "../components/ui/ThemeToggle";
import { API_BASE_URL } from "../lib/api";

const SCRIPT_SNIPPET = `<script src="${API_BASE_URL}/track.js"\n  data-site-key="YOUR_SITE_KEY"></script>`;

const SITE_KEY_EXAMPLE = `sp_live_84da57d3461067b6aff00beb1fed7c3f`;

const PRODUCT_CARD_SNIPPET = `<div class="product-card"
     data-storepulse-product-id="prod_123"
     data-storepulse-product-name="Blue Ceramic Mug">
  <img src="mug.jpg" alt="Blue Ceramic Mug" />
  <h3>Blue Ceramic Mug</h3>
  <button>Add to Cart</button>
</div>`;

const PRODUCT_GRID_SNIPPET = `<div class="product-grid">
  <a href="/products/mug-blue"
     class="product-card"
     data-storepulse-product-id="prod_123"
     data-storepulse-product-name="Blue Ceramic Mug">
    <img src="mug-blue.jpg" alt="Blue Ceramic Mug" />
    <span>Blue Ceramic Mug — $18.00</span>
  </a>

  <a href="/products/mug-red"
     class="product-card"
     data-storepulse-product-id="prod_124"
     data-storepulse-product-name="Red Ceramic Mug">
    <img src="mug-red.jpg" alt="Red Ceramic Mug" />
    <span>Red Ceramic Mug — $18.00</span>
  </a>
</div>`;

const REACT_SNIPPET = `<div
  className="product-card"
  data-storepulse-product-id={product.id}
  data-storepulse-product-name={product.name}
>
  {/* card contents */}
</div>`;

const LIQUID_SNIPPET = `<div
  class="product-card"
  data-storepulse-product-id="{{ product.id }}"
  data-storepulse-product-name="{{ product.title | escape }}"
>`;

const PAGE_VIEW_PAYLOAD = `{
  "apiKey": "YOUR_SITE_KEY",
  "visitorId": "uuid-v4-string",
  "type": "PAGE_VIEW",
  "pageUrl": "https://store.com/products",
  "referrer": "https://google.com"
}`;

const PRODUCT_CLICK_PAYLOAD = `{
  "apiKey": "YOUR_SITE_KEY",
  "visitorId": "uuid-v4-string",
  "type": "PRODUCT_CLICK",
  "pageUrl": "https://store.com/products",
  "referrer": "https://google.com",
  "productId": "prod_123",
  "productName": "Blue Ceramic Mug"
}`;

const TROUBLESHOOTING = [
  {
    symptom: 'Console error: "Storepulse: missing data-site-key attribute on script tag"',
    cause: 'You forgot to add data-site-key="..." to the <script> tag.',
  },
  {
    symptom: "Page views not appearing",
    cause: "Check the script's src domain matches where your API is hosted — events post to {script domain}/api/events.",
  },
  {
    symptom: "Product clicks not tracked",
    cause: "Ensure data-storepulse-product-id is present on the clicked element or one of its ancestors — the script stops walking up at <body>, so the attribute must be inside <body>.",
  },
  {
    symptom: "Same visitor counted as new every time",
    cause: "localStorage may be blocked (private browsing, cookie/storage restrictions) — this is expected behavior in those environments.",
  },
];

const TOC = [
  { id: "get-site-key", label: "Get your site key" },
  { id: "install-script", label: "Install the tracking script" },
  { id: "page-view-tracking", label: "How page view tracking works" },
  { id: "product-click-tracking", label: "Tracking product clicks" },
  { id: "framework-notes", label: "Framework-specific notes" },
  { id: "verify-integration", label: "Verifying your integration" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "event-payloads", label: "Data sent per event" },
];

function Section({ id, step, title, children, last = false }) {
  return (
    <section
      id={id}
      style={{
        padding: "var(--space-8) 0",
        borderBottom: last ? "none" : "1px solid var(--divider)",
        scrollMarginTop: "var(--space-6)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        {step && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              flexShrink: 0,
              borderRadius: "50%",
              background: "var(--stamp)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {step}
          </span>
        )}
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      <div className="grid" style={{ gap: "var(--space-3)" }}>
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }) {
  return (
    <h3 style={{ marginTop: "var(--space-5)", marginBottom: "var(--space-1)", fontSize: 16 }}>
      {children}
    </h3>
  );
}

function CodeLabel({ children }) {
  return (
    <div className="card-kicker" style={{ marginBottom: "calc(var(--space-1) * -1 + 2px)" }}>
      {children}
    </div>
  );
}

function P({ children }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.85, margin: 0 }}>{children}</p>
  );
}

export default function Docs() {
  const navigate = useNavigate();

  const handleTocClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="min-h-screen">
      <div
        style={{
          position: "fixed",
          top: "var(--space-4)",
          right: "var(--space-4)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
        }}
      >
        <ThemeToggle />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-icon"
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <main className="mx-auto" style={{ maxWidth: 720, padding: "var(--space-8) var(--space-4)" }}>
        <h1 style={{ marginBottom: "var(--space-2)" }}>Developer guide</h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, opacity: 0.8, marginBottom: "var(--space-6)" }}>
          Integrate StorePulse into your store in under 5 minutes. This guide covers
          installation, automatic page view tracking, and product click tracking.
        </p>

        <nav
          aria-label="On this page"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-1) var(--space-4)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-6)",
            background: "var(--paper-card)",
            border: "1px solid var(--divider)",
          }}
        >
          {TOC.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleTocClick(e, item.id)}
              className="docs-toc-link"
              style={{ fontSize: 14 }}
            >
              <span style={{ color: "var(--stamp)", fontWeight: 600 }}>{index + 1}.</span>{" "}
              {item.label}
            </a>
          ))}
        </nav>

        <Section id="get-site-key" step={1} title="Get your site key">
          <P>
            Every site you track has a unique <code>apiKey</code> generated when you
            register it in your StorePulse dashboard. You&apos;ll need this key to
            install the script.
          </P>
          <CodeLabel>Site key format</CodeLabel>
          <CodeBlock>{SITE_KEY_EXAMPLE}</CodeBlock>
          <P>Find it on that site&apos;s settings page once you&apos;re logged in.</P>
        </Section>

        <Section id="install-script" step={2} title="Install the tracking script">
          <P>
            Add the following snippet to your site, ideally just before the closing{" "}
            <code>&lt;/body&gt;</code> tag (or in your global layout/template file):
          </P>
          <CodeLabel>HTML</CodeLabel>
          <CodeBlock>{SCRIPT_SNIPPET}</CodeBlock>
          <P>
            Replace <code>data-site-key</code> with the API key for this specific site
            (find it on that site&apos;s settings page once you&apos;re logged in).
          </P>
          <P>
            <strong>Important:</strong> the script determines where to send events
            based on its own <code>src</code> URL — it posts to <code>/api/events</code>{" "}
            on the same domain the script itself is loaded from.
          </P>
          <P>
            That&apos;s it for basic setup. Once this script tag is on the page,{" "}
            <strong>page views are tracked automatically</strong> — no extra code
            needed.
          </P>
        </Section>

        <Section id="page-view-tracking" step={3} title="How page view tracking works">
          <P>On every page load, the script:</P>
          <ol style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85, margin: 0, paddingLeft: "1.4em" }}>
            <li>Reads the <code>data-site-key</code> from its own <code>&lt;script&gt;</code> tag</li>
            <li>
              Gets or creates a persistent <code>visitorId</code> (a UUID stored in{" "}
              <code>localStorage</code> under <code>sp_visitor_id</code>, so the same
              visitor is recognized across sessions on the same browser)
            </li>
            <li>Sends a <code>PAGE_VIEW</code> event with the current page URL and referrer</li>
          </ol>
          <P>No integration work is required for this — it just works once the script is on the page.</P>
        </Section>

        <Section id="product-click-tracking" step={4} title="Tracking product clicks">
          <P>
            To track clicks on individual products (e.g. product cards, &quot;Add to
            Cart&quot; buttons, product links), add two <code>data-</code> attributes
            to the relevant element:
          </P>
          <CodeLabel>HTML</CodeLabel>
          <CodeBlock>{PRODUCT_CARD_SNIPPET}</CodeBlock>
          <ul style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85, margin: 0, paddingLeft: "1.4em" }}>
            <li><code>data-storepulse-product-id</code> — required. Your internal product ID (SKU, database ID, etc.)</li>
            <li><code>data-storepulse-product-name</code> — recommended. Human-readable name, shown in your analytics dashboard</li>
          </ul>

          <SubHeading>How click detection works</SubHeading>
          <P>
            You don&apos;t need to attach a click handler to every product element
            yourself. The script listens for clicks anywhere on the page and walks up
            the DOM tree (<code>event.target</code> → parents) until it finds the
            nearest ancestor with <code>data-storepulse-product-id</code>.
          </P>
          <P>
            You can put the <code>data-storepulse-*</code> attributes on a wrapping
            container (like a product card <code>&lt;div&gt;</code>), and clicks
            anywhere inside it — the image, the title, the button — will register as a
            click on that product. You do not need to add tracking attributes to every
            child element individually.
          </P>

          <SubHeading>Example: e-commerce product grid</SubHeading>
          <CodeLabel>HTML</CodeLabel>
          <CodeBlock>{PRODUCT_GRID_SNIPPET}</CodeBlock>
          <P>
            Clicking anywhere inside either <code>&lt;a&gt;</code> tag will fire a{" "}
            <code>PRODUCT_CLICK</code> event with the correct <code>productId</code>{" "}
            and <code>productName</code>.
          </P>
        </Section>

        <Section id="framework-notes" step={5} title="Framework-specific notes">
          <SubHeading>React / Vue / Next.js / etc.</SubHeading>
          <P>
            Just add the same <code>data-storepulse-product-id</code> and{" "}
            <code>data-storepulse-product-name</code> attributes to your JSX/template
            elements:
          </P>
          <CodeLabel>JSX</CodeLabel>
          <CodeBlock>{REACT_SNIPPET}</CodeBlock>
          <P>
            Since tracking uses event delegation on <code>document</code>, it works
            automatically with dynamically rendered elements (no need to re-initialize
            tracking when your component re-renders or new products load).
          </P>

          <SubHeading>Server-rendered sites (PHP, WordPress, Shopify Liquid, etc.)</SubHeading>
          <P>
            Just output the attributes as part of your template&apos;s HTML, using
            whatever templating syntax your platform uses:
          </P>
          <CodeLabel>Liquid</CodeLabel>
          <CodeBlock>{LIQUID_SNIPPET}</CodeBlock>
        </Section>

        <Section id="verify-integration" step={6} title="Verifying your integration">
          <ol style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85, margin: 0, paddingLeft: "1.4em" }}>
            <li>Open your site with browser dev tools open (Network tab)</li>
            <li>
              Load a page — you should see a <code>POST</code> request to{" "}
              <code>/api/events</code> with <code>type: "PAGE_VIEW"</code>
            </li>
            <li>
              Click on a tracked product — you should see another request with{" "}
              <code>type: "PRODUCT_CLICK"</code> and your <code>productId</code>/
              <code>productName</code> in the payload
            </li>
            <li>Check your StorePulse dashboard — events should appear shortly after</li>
          </ol>
          <P>
            <strong>Note:</strong> the script fails silently on network errors (no
            console errors, no thrown exceptions) so it never breaks your site if
            StorePulse is temporarily unreachable. This means a missing event won&apos;t
            show up as an error in your console — always verify using the Network tab
            or your dashboard, not by watching for JS errors.
          </P>
        </Section>

        <Section id="troubleshooting" step={7} title="Troubleshooting">
          <div className="grid" style={{ gap: "var(--space-3)" }}>
            {TROUBLESHOOTING.map((item, index) => (
              <div
                key={item.symptom}
                style={{
                  paddingBottom: "var(--space-3)",
                  borderBottom: index < TROUBLESHOOTING.length - 1 ? "1px dotted var(--divider)" : "none",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.symptom}</div>
                <div style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.55 }}>{item.cause}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="event-payloads" step={8} title="Data sent per event" last>
          <P>For reference, here&apos;s exactly what&apos;s sent to <code>/api/events</code>:</P>
          <CodeLabel>Page view</CodeLabel>
          <CodeBlock>{PAGE_VIEW_PAYLOAD}</CodeBlock>
          <CodeLabel>Product click</CodeLabel>
          <CodeBlock>{PRODUCT_CLICK_PAYLOAD}</CodeBlock>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
