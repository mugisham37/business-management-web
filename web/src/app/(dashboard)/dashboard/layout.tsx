"use client"
import React from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { cx } from "@/lib/utils"
import { Sidebar } from "@/components/Dashboard/navigation/Sidebar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Track component mount
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect to login if not authenticated (with grace period)
  React.useEffect(() => {
    // Don't check until component is mounted and initialization is complete
    if (!isMounted || !isInitialized) {
      return
    }

    // If still loading, wait
    if (isLoading) {
      return
    }

    // Give a small grace period for state to propagate
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log('[Dashboard Layout] Not authenticated, redirecting to login');
        router.push('/auth/login?redirect=/dashboard/overview')
      } else {
        console.log('[Dashboard Layout] User authenticated:', user?.email);
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isMounted, isInitialized, isLoading, isAuthenticated, router, user])

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Loading your dashboard...</p>
            <p className="text-xs text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar}
        brandName={user.organization?.name || 'Dashboard'}
      />
      <main
        className={cx(
          isCollapsed ? "lg:pl-[60px]" : "lg:pl-64",
          "min-h-screen w-full transform-gpu transition-all duration-200 ease-in-out will-change-transform lg:bg-gray-50 lg:py-3 lg:pr-3 lg:dark:bg-gray-950",
        )}
      >
        <div className="mx-auto max-w-screen-2xl">
          <div className="bg-white p-4 sm:p-6 lg:rounded-lg lg:border lg:border-gray-200 dark:bg-gray-925 lg:dark:border-gray-900">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
