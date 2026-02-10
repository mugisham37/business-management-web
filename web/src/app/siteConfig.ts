export const siteConfig = {
  name: "Database",
  url: "https://database.tremor.so",
  description: "The database for modern applications.",
  baseLinks: {
    home: "/",
    about: "/about",
    changelog: "/changelog",
    pricing: "/pricing",
    imprint: "/imprint",
    privacy: "/privacy",
    terms: "/terms",
    overview: "/dashboard/overview",
    details: "/dashboard/details",
    reports: "/dashboard/reports",
    transactions: "/dashboard/transactions",
    onboarding: "/auth/onboarding/products",
    quotes: {
      overview: "/dashboard/business/quotes/overview",
      monitoring: "/dashboard/business/quotes/monitoring",
      audits: "/dashboard/business/quotes/audits",
    },
    settings: {
      general: "/dashboard/settings/general",
      billing: "/dashboard/settings/billing",
      users: "/dashboard/settings/users",
      audit: "/dashboard/settings/audit",
    },
  },
}

export type siteConfig = typeof siteConfig
