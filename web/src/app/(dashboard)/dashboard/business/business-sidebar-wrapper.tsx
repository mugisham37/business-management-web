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
      <header className="business-header-layout">
        <button
          onClick={() => setBusinessSidebarOpen(!businessSidebarOpen)}
          className="inline-flex items-center justify-center text-foreground hover:bg-[var(--interactive-hover-light)] dark:hover:bg-[var(--interactive-hover-dark)] transition-colors-standard focus-ring-business"
          style={{
            borderRadius: 'var(--radius-business-button)',
            padding: 'var(--spacing-sm)'
          }}
          aria-label={businessSidebarOpen ? "Collapse business sidebar" : "Expand business sidebar"}
          title={businessSidebarOpen ? "Collapse business sidebar" : "Expand business sidebar"}
        >
          {businessSidebarOpen ? (
            <PanelRightClose style={{ width: 'var(--nav-item-icon-size)', height: 'var(--nav-item-icon-size)' }} />
          ) : (
            <PanelRightOpen style={{ width: 'var(--nav-item-icon-size)', height: 'var(--nav-item-icon-size)' }} />
          )}
        </button>
        <div style={{ marginRight: 'var(--spacing-sm)', height: 'var(--spacing-md)', width: '1px', backgroundColor: 'var(--border)' }} />
        <Breadcrumbs />
      </header>

      {/* Business Section Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Business Sidebar - Inline (not fixed) */}
        {businessSidebarOpen && (
          <aside className="business-sidebar-layout">
            <SidebarProvider defaultOpen={true}>
              <AppSidebar variant="sidebar" collapsible="none" />
            </SidebarProvider>
          </aside>
        )}

        {/* Main Content */}
        <main className="business-content-layout">
          {children}
        </main>
      </div>
    </div>
  )
}
