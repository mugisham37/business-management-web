"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/Sidebar"
import { AppSidebar } from "@/components/Dashboard/business/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/Dashboard/business/navigation/Breadcrumbs"
import { PanelRightClose, PanelRightOpen } from "lucide-react"

export function BusinessSidebarWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [businessSidebarOpen, setBusinessSidebarOpen] = React.useState(true)

  return (
    <div className="flex h-full w-full flex-col">
      {/* Business Section Header with Toggle and Breadcrumbs */}
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
        <button
          onClick={() => setBusinessSidebarOpen(!businessSidebarOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          aria-label={businessSidebarOpen ? "Collapse business sidebar" : "Expand business sidebar"}
          title={businessSidebarOpen ? "Collapse business sidebar" : "Expand business sidebar"}
        >
          {businessSidebarOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </button>
        <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
        <Breadcrumbs />
      </header>

      {/* Business Section Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Business Sidebar - Inline (not fixed) */}
        {businessSidebarOpen && (
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-925 transition-all duration-300 ease-in-out">
            <SidebarProvider defaultOpen={true}>
              <AppSidebar variant="sidebar" collapsible="none" />
            </SidebarProvider>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
