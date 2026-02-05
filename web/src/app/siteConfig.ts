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
    overview: "/overview",
    details: "/details",
    login: "/dashboard/login",
    quotes: {
      overview: "/business/quotes/overview",
      monitoring: "/business/quotes/monitoring",
      audits: "/business/quotes/audits",
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
