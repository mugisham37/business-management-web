"use client"
import { TabNavigation, TabNavigationLink } from "@/components/ui/TabNavigation"
import { MetricsCards } from "@/components/Dashboard/business/homepage/MetricsCards"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import { siteConfig } from "@/app/siteConfig"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.quotes.overview },
  { name: "Monitoring", href: siteConfig.baseLinks.quotes.monitoring },
  { name: "Audits", href: siteConfig.baseLinks.quotes.audits },
]
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <>
      <div className="bg-[var(--business-content-bg)]">
        <div style={{ padding: 'var(--spacing-md) var(--spacing-business-card-padding)' }}>
          <MetricsCards />
        </div>
        <TabNavigation 
          style={{ 
            marginTop: 'var(--spacing-business-section-gap)', 
            gap: 'var(--spacing-sm)',
            padding: '0 var(--spacing-business-card-padding)'
          }}
        >
          {navigation.map((item) => (
            <TabNavigationLink
              key={item.name}
              asChild
              active={pathname === item.href}
            >
              <Link href={item.href}>{item.name}</Link>
            </TabNavigationLink>
          ))}
        </TabNavigation>
        <>{children}</>
      </div>
    </>
  )
}
