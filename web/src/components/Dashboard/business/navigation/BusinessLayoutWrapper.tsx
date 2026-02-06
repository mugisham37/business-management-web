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
    <div 
      className={`${fontClasses} -m-4 sm:-m-6 lg:-m-6 min-h-screen relative`}
      style={{
        '--parent-sidebar-width': '256px',
      } as React.CSSProperties}
    >
      {/* 
        Global styles for dual-sidebar layout:
        - Position business sidebar after parent dashboard sidebar
        - Parent sidebar: z-50, left-0, width 256px (expanded) or 60px (collapsed)
        - Business sidebar: z-10, offset by parent's width to appear beside it
        - Z-index hierarchy ensures parent sidebar stays on top
      */}
      <style jsx global>{`
        /* On desktop, position business sidebar beside parent sidebar */
        @media (min-width: 768px) {
          /* Target all fixed sidebar elements within business layout */
          .business-sidebar-wrapper [data-side="left"] > div:last-child {
            left: var(--parent-sidebar-width, 256px) !important;
          }
        }
        
        /* Remove default spacer width since parent sidebar creates the offset */
        @media (min-width: 768px) {
          .business-sidebar-wrapper [data-sidebar="sidebar"] > div:first-child {
            width: 0 !important;
          }
        }
      `}</style>
      
      <div className="business-sidebar-wrapper">
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <div className="w-full">
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
              <SidebarTrigger className="-ml-1" />
              <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
              <Breadcrumbs />
            </header>
            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}
