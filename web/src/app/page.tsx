import CodeExample from "@/components/Landing/ui/CodeExample"
import Cta from "@/components/Landing/ui/Cta"
import Features from "@/components/Landing/ui/Features"
import { GlobalDatabase } from "@/components/Landing/ui/GlobalDatabase"
import Hero from "@/components/Landing/ui/Hero"
import LogoCloud from "@/components/Landing/ui/LogoCloud"

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
      <GlobalDatabase />
      <CodeExample />
      <Features />
      <Cta />
    </main>
  )
}
