import { Navigation } from "@/components/landing/ui/Navbar"
import Footer from "@/components/landing/ui/Footer"
import CodeExample from "@/components/landing/ui/CodeExample"
import Cta from "@/components/landing/ui/Cta"
import Features from "@/components/landing/ui/Features"
import { GlobalDatabase } from "@/components/landing/ui/GlobalDatabase"
import Hero from "@/components/landing/ui/Hero"
import LogoCloud from "@/components/landing/ui/LogoCloud"
import { ThemeProvider } from "next-themes"

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navigation />
        <main className="flex flex-col overflow-hidden">
          <Hero />
          <LogoCloud />
          <GlobalDatabase />
          <CodeExample />
          <Features />
          <Cta />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
