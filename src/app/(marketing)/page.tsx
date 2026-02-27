import CodeExample from "@/components/landing/CodeExample"
import Cta from "@/components/landing/Cta"
import Features from "@/components/landing/Features"
import { GlobalDatabase } from "@/components/landing/GlobalDatabase"
import Hero from "@/components/landing/Hero"
import LogoCloud from "@/components/landing/LogoCloud"

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
