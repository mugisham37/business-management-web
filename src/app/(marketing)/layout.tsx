import Footer from "@/components/landing/Footer"
import { Navigation } from "@/components/landing/Navbar"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}
