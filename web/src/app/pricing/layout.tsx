import { Navigation } from "@/components/landing/ui/Navbar"
import Footer from "@/components/landing/ui/Footer"
import { ThemeProvider } from "next-themes"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navigation />
        <main className="mx-auto max-w-6xl pt-36">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
