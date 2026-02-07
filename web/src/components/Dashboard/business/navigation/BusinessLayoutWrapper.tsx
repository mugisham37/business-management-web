"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar"
import { AppSidebar } from "@/components/Dashboard/business/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/Dashboard/business/navigation/Breadcrumbs"
import { ReactNode } from "react"

interface BusinessLayoutWrapperProps {
  children: ReactNode
  defaultOpen: boolean
  fontClasses: string
}

export function BusinessLayoutWrapper({
  children,
  defaultOpen,
  fontClasses,
}: BusinessLayoutWrapperProps) {
  return (
    <div className={`${fontClasses} -m-4 sm:-m-6 lg:-m-6 min-h-screen relative business-sidebar-wrapper`}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="w-full">
          <header 
            className="sticky top-0 flex shrink-0 items-center border-b border-border bg-background"
            style={{ 
              height: 'var(--spacing-business-header-height)',
              gap: 'var(--spacing-sm)',
              padding: '0 var(--spacing-md)',
              zIndex: 'var(--z-business-header)'
            }}
          >
            <SidebarTrigger className="-ml-1" />
            <div 
              className="bg-border"
              style={{
                height: 'var(--spacing-md)',
                width: '1px',
                marginRight: 'var(--spacing-sm)'
              }}
            />
            <Breadcrumbs />
          </header>
          <main style={{ padding: 'var(--business-content-padding)' }}>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
