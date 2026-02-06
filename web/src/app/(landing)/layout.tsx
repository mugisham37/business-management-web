import Footer from "@/components/Landing/Footer"
import { Navigation } from "@/components/Landing/Navbar"

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
