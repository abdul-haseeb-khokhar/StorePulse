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
  notifications: {
    list: (params) => ["notifications", params],
  },
  billing: {
    paymentRequests: (params) => ["billing", "payment-requests", params],
    history: (params) => ["billing", "history", params],
  },
  admin: {
    stats: ["admin", "stats"],
    users: {
      list: (params) => ["admin", "users", params],
      detail: (id) => ["admin", "users", id],
      history: (id, params) => ["admin", "users", id, "history", params],
      overLimit: ["admin", "users", "over-limit"],
    },
    sites: {
      list: (params) => ["admin", "sites", params],
    },
    admins: ["admin", "admins"],
    paymentRequests: (params) => ["admin", "payment-requests", params],
    paymentRequestsPendingCount: ["admin", "payment-requests", "pending-count"],
    logs: (params) => ["admin", "logs", params],
  },
};
