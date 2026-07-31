export const queryKeys = {
  sites: {
    all: ["sites"],
    detail: (siteId) => ["sites", siteId],
  },
  analytics: {
    summary: (siteId, range) => ["analytics", siteId, "summary", range],
    traffic: (siteId, range) => ["analytics", siteId, "traffic", range],
    topProducts: (siteId, range) => ["analytics", siteId, "top-products", range],
    topReferrers: (siteId, range) => ["analytics", siteId, "top-referrers", range],
  },
  me: ["me"],
};
