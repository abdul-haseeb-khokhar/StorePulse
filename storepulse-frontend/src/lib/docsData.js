/**
 * Static copy/snippets for the /docs page: section list, install
 * snippets per framework, example payloads, and the troubleshooting table.
 */
import { API_BASE_URL } from "./api";

export const DOC_SECTIONS = [
  { id: "get-site-key", title: "1. Get Your Site Key" },
  { id: "install-script", title: "2. Install the Tracking Script" },
  { id: "page-view-tracking", title: "3. How Page View Tracking Works" },
  { id: "product-click-tracking", title: "4. Tracking Product Clicks" },
  { id: "framework-notes", title: "5. Framework-Specific Notes" },
  { id: "verify-integration", title: "6. Verifying Your Integration" },
  { id: "troubleshooting", title: "7. Troubleshooting & Gotchas" },
  { id: "event-payloads", title: "8. Data Sent per Event" },
];

export const SCRIPT_SNIPPET = `<script src="${API_BASE_URL}/track.js"
  data-site-key="YOUR_SITE_KEY"></script>`;

// Fake but shaped exactly like a real key (sp_live_ + 32 hex chars, see
// apiKey.js on the backend) so this reads as "here's what yours will look
// like" rather than a literal fill-in-the-blank placeholder — it's not
// wired to any real account or site.
export const SITE_KEY_EXAMPLE = `sp_live_3f9a21bc7d84e6f019a4c58b2d7e0f31`;

export const PRODUCT_CARD_SNIPPET = `<div class="product-card"
     data-storepulse-product-id="prod_123"
     data-storepulse-product-name="Blue Ceramic Mug">
  <img src="mug.jpg" alt="Blue Ceramic Mug" />
  <h3>Blue Ceramic Mug</h3>
  <button>Add to Cart</button>
</div>`;

export const PRODUCT_GRID_SNIPPET = `<div class="product-grid">
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

export const REACT_SNIPPET = `<div
  className="product-card"
  data-storepulse-product-id={product.id}
  data-storepulse-product-name={product.name}
>
  {/* card contents */}
</div>`;

export const LIQUID_SNIPPET = `<div
  class="product-card"
  data-storepulse-product-id="{{ product.id }}"
  data-storepulse-product-name="{{ product.title | escape }}"
>`;

export const PAGE_VIEW_PAYLOAD = `{
  "apiKey": "YOUR_SITE_KEY",
  "visitorId": "uuid-v4-string",
  "type": "PAGE_VIEW",
  "pageUrl": "https://store.com/products",
  "referrer": "https://google.com"
}`;

export const PRODUCT_CLICK_PAYLOAD = `{
  "apiKey": "YOUR_SITE_KEY",
  "visitorId": "uuid-v4-string",
  "type": "PRODUCT_CLICK",
  "pageUrl": "https://store.com/products",
  "referrer": "https://google.com",
  "productId": "prod_123",
  "productName": "Blue Ceramic Mug"
}`;

export const TROUBLESHOOTING = [
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
