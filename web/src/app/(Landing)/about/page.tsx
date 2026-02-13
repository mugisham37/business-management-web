import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Benefits from "@/components/landing/Benefits"
import TeamGallery from "@/components/landing/TeamGallery"
import { cx } from "@/lib/utils"
import Balancer from "react-wrap-balancer"

export default function About() {
  return (
    <div className="mt-36 flex flex-col overflow-hidden px-3">
      <section
        aria-labelledby="about-overview"
        className="animate-slide-up-fade"
        style={{
          animationDuration: "600ms",
          animationFillMode: "backwards",
        }}
      >
        <Badge>about database</Badge>
        <h1
          id="about-overview"
          className="mt-2 inline-block bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl"
        >
          <Balancer>
            We are engineers, building the database platform we always wanted
          </Balancer>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Data is changing every aspect of running a business, and it is
          happening now. <br /> Database is at the core of this revolution.
        </p>
      </section>
      <TeamGallery />
      <Benefits />
      <section aria-labelledby="vision-title" className="mx-auto mt-40">
        <h2
          id="vision-title"
          className="inline-block bg-gradient-to-t from-foreground to-foreground/80 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl"
        >
          Our Vision
        </h2>
        <div className="mt-6 max-w-prose space-y-4 text-muted-foreground">
          <p className="text-lg leading-8">
            We envision a world where data management is no longer a complex
            challenge but a powerful advantage. By integrating cutting-edge AI
            into database solutions, we aim to transform raw data into strategic
            assets, empowering businesses to innovate faster and more
            efficiently.
          </p>
          <p className="text-lg leading-8">
            We believe in removing the barriers of data complexity and
            scalability, enabling teams to focus on insights and innovations
            rather than maintenance and management. Our goal is to equip every
            organization with the tools they need to harness the full potential
            of their data, driving growth and excellence in every interaction.
          </p>
          <p
            className={cx(
              "w-fit rotate-3 font-handwriting text-3xl text-primary",
            )}
          >
            – Alex and Robin
          </p>
        </div>
        <Button className="mt-32 h-10 w-full shadow-xl shadow-primary/20">
          View Open Roles
        </Button>
      </section>
    </div>
  )
}
