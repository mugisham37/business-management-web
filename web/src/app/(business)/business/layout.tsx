import { SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar"
import { AppSidebar } from "@/components/Business/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/Business/navigation/Breadcrumbs"
import { cookies } from "next/headers"
import localFont from "next/font/local"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Dashboard | Database",
  description: "Manage your business operations, quotes, orders, and insights.",
}

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="w-full">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
            <SidebarTrigger className="-ml-1" />
            <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
            <Breadcrumbs />
          </header>
          <main>{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
