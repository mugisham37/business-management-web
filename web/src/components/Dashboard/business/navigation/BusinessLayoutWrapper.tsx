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
            className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4"
            style={{ zIndex: 'var(--z-sticky)' }}
          >
            <SidebarTrigger className="-ml-1" />
            <div className="mr-2 h-4 w-px bg-border" />
            <Breadcrumbs />
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
