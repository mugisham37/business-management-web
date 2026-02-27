export const siteConfig = {
  name: "Business Management",
  url: "https://yourdomain.com",
  description: "Modern business management platform for growing companies.",
  baseLinks: {
    // Marketing pages
    home: "/",
    about: "/about",
    changelog: "/changelog",
    pricing: "/pricing",
    
    // Legal pages
    imprint: "/imprint",
    privacy: "/privacy",
    terms: "/terms",
    
    // Auth
    auth: "/auth",
    
    // Dashboard pages
    dashboard: {
      overview: "/dashboard/overview",
      details: "/dashboard/details",
      settings: {
        general: "/dashboard/settings/general",
        billing: "/dashboard/settings/billing",
        users: "/dashboard/settings/users",
      },
    },
  },
}

export type siteConfig = typeof siteConfig
