"use client"
import { siteConfig } from "@/app/siteConfig"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumbs() {
  const pathname = usePathname()

  // Parse the pathname to create breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean)
  
  // Create breadcrumb structure
  const breadcrumbs = [
    { name: "Business", href: siteConfig.baseLinks.quotes.overview },
  ]

  // Add dynamic segments based on current path
  if (pathname.includes("/quotes")) {
    breadcrumbs.push({ name: "Quotes", href: siteConfig.baseLinks.quotes.overview })
    
    if (pathname.includes("/overview")) {
      breadcrumbs.push({ name: "Overview", href: siteConfig.baseLinks.quotes.overview })
    } else if (pathname.includes("/monitoring")) {
      breadcrumbs.push({ name: "Monitoring", href: siteConfig.baseLinks.quotes.monitoring })
    } else if (pathname.includes("/audits")) {
      breadcrumbs.push({ name: "Audits", href: siteConfig.baseLinks.quotes.audits })
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="ml-2">
      <ol role="list" className="flex items-center space-x-3 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                className="mr-3 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <Link
              href={item.href}
              className={
                index === breadcrumbs.length - 1
                  ? "font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
              aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
