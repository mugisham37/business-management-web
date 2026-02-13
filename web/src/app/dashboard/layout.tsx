"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { cx } from "@/lib/utils"

import { Sidebar } from "@/components/dashboard/navigation/Sidebar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Hide main sidebar when on business routes (they have their own sidebar)
  const isBusinessRoute = pathname.startsWith("/dashboard/business")

  if (isBusinessRoute) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className={cx(
          isCollapsed ? "lg:pl-[60px]" : "lg:pl-64",
          "ease transform-gpu transition-all duration-100 will-change-transform bg-background lg:py-3 lg:pr-3",
        )}
      >
        <div className="bg-background p-4 sm:p-6 lg:rounded-lg lg:border border-border">
          {children}
        </div>
      </main>
    </div>
  )
}
