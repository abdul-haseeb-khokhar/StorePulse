export const queryKeys = {
  sites: {
    all: ["sites"],
    detail: (siteId) => ["sites", siteId],
    usage: ["sites", "usage"],
  },
  analytics: {
    summary: (siteId, range) => ["analytics", siteId, "summary", range],
    traffic: (siteId, range) => ["analytics", siteId, "traffic", range],
    topProducts: (siteId, range) => ["analytics", siteId, "top-products", range],
    topReferrers: (siteId, range) => ["analytics", siteId, "top-referrers", range],
  },
  me: ["me"],
  admin: {
    stats: ["admin", "stats"],
    users: {
      list: (params) => ["admin", "users", params],
      detail: (id) => ["admin", "users", id],
    },
    sites: {
      list: (params) => ["admin", "sites", params],
    },
    admins: ["admin", "admins"],
  },
};
