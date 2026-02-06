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
    transactions: "/dashboard/transactions",
    reports: "/dashboard/reports",
    business: "/dashboard/business/quotes/overview",
    customer: "/dashboard/customer",
    login: "/dashboard/login",
    quotes: {
      overview: "/dashboard/business/quotes/overview",
      monitoring: "/dashboard/business/quotes/monitoring",
      audits: "/dashboard/business/quotes/audits",
    },
    settings: {
      general: "/dashboard/settings/general",
      audit: "/dashboard/settings/audit",
      billing: "/dashboard/settings/billing",
      users: "/dashboard/settings/users",
    },
  },
}

export type siteConfig = typeof siteConfig
