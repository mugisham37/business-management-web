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
    settings: {
      general: "/dashboard/settings/general",
      billing: "/dashboard/settings/billing",
      users: "/dashboard/settings/users",
    },
  },
}

export type siteConfig = typeof siteConfig
