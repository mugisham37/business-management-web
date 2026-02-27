import { Sidebar } from "@/components/dashboard/navigation/Sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar />
      <main className="lg:pl-72">{children}</main>
    </div>
  )
}
