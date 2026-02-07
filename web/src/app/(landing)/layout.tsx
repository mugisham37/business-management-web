import Footer from "@/components/Landing/Footer"
import { Navigation } from "@/components/Landing/Navbar"
import { NotificationProvider } from "@/components/ui/NotificationProvider"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <NotificationProvider position="top-right" maxNotifications={3}>
      <Navigation />
      {children}
      <Footer />
    </NotificationProvider>
  )
}
