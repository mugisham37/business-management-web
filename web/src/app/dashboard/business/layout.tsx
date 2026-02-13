"use client"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/business/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/dashboard/business/navigation/Breadcrumbs"
import { cx } from "@/lib/utils"

function BusinessLayoutContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()
  
  return (
    <div 
      className="flex w-full flex-1 flex-col transition-[margin-left] duration-150 ease-in-out"
      style={{
        marginLeft: open ? '16rem' : '0'
      }}
    >
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="mr-2 h-4 w-px bg-border" />
        <Breadcrumbs />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <BusinessLayoutContent>{children}</BusinessLayoutContent>
    </SidebarProvider>
  )
}

