import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import Benefits from "@/components/Landing/Benefits"
import TeamGallery from "@/components/Landing/TeamGallery"
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
          className="heading-gradient mt-2 text-4xl sm:text-6xl md:text-6xl"
        >
          <Balancer>
            We are engineers, building the database platform we always wanted
          </Balancer>
        </h1>
        <p className="text-landing-body mt-6 max-w-2xl">
          Data is changing every aspect of running a business, and it is
          happening now. <br /> Database is at the core of this revolution.
        </p>
      </section>
      <TeamGallery />
      <Benefits />
      <section aria-labelledby="vision-title" className="mx-auto mt-40">
        <h2
          id="vision-title"
          className="heading-gradient-top text-4xl md:text-5xl"
        >
          Our Vision
        </h2>
        <div className="prose-landing mt-6 space-y-4">
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
          <p className={cx("text-signature rotate-3")}>
            – Alex and Robin
          </p>
        </div>
        <Button className="shadow-cta-indigo mt-32 h-10 w-full">
          View Open Roles
        </Button>
      </section>
    </div>
  )
}
