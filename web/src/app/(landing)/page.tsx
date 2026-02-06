import CodeExample from "@/components/Landing/CodeExample"
import Cta from "@/components/Landing/Cta"
import Features from "@/components/Landing/Features"
import { GlobalDatabase } from "@/components/Landing/GlobalDatabase"
import Hero from "@/components/Landing/Hero"
import LogoCloud from "@/components/Landing/LogoCloud"

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
