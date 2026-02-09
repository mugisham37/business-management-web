import { Badge } from "@/components/ui/Badge"
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
        <Badge>about our platform</Badge>
        <h1
          id="about-overview"
          className="heading-gradient mt-2 text-4xl sm:text-6xl md:text-6xl"
        >
          <Balancer>
            We are builders, creating the business management platform that grows with you
          </Balancer>
        </h1>
        <p className="text-landing-body mt-6 max-w-2xl">
          Business operations are evolving rapidly, and the right tools make all
          the difference. <br /> Our platform is at the heart of this transformation.
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
            We envision a world where business management is no longer fragmented
            across multiple tools but unified in one powerful platform. By creating
            software that scales from solo entrepreneurs to enterprise operations,
            we aim to transform how businesses operate, empowering teams to grow
            faster and work more efficiently.
          </p>
          <p className="text-lg leading-8">
            We believe in removing the barriers of complexity and disconnected
            systems, enabling businesses to focus on growth and customer success
            rather than wrestling with software. Our goal is to equip every
            organization with the complete toolkit they need to manage operations
            seamlessly, driving profitability and excellence in every transaction.
          </p>
          <p className={cx("text-signature rotate-3")}>
            – The Team
          </p>
        </div>
      </section>
    </div>
  )
}
