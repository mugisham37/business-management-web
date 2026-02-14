"use client"
import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cx } from "@/lib/utils"
import { useAuth } from "@/foundation/providers/AuthProvider"

import { Sidebar } from "@/components/dashboard/navigation/Sidebar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Authentication guard - redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])

  // Hide main sidebar when on business routes (they have their own sidebar)
  const isBusinessRoute = pathname.startsWith("/dashboard/business")

  // Show loading skeleton while checking authentication
  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  if (isBusinessRoute) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar}
        user={user}
      />
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
