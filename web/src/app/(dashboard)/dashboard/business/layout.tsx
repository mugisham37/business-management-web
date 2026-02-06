import { BusinessSidebarWrapper } from "./business-sidebar-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Dashboard | Database",
  description: "Manage your business operations, quotes, orders, and insights.",
}

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessSidebarWrapper>
      {children}
    </BusinessSidebarWrapper>
  )
}
