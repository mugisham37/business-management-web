import { Badge } from "@/components/ui/Badge"
import Benefits from "@/components/Landing/Benefits"
import TeamGallery from "@/components/Landing/TeamGallery"
import Balancer from "react-wrap-balancer"

export default function About() {
  return (
    <div className="about-page-container">
      <section
        aria-labelledby="about-overview"
        className="about-overview-section"
      >
        <Badge>about our system</Badge>
        <h1
          id="about-overview"
          className="about-main-heading"
        >
          <Balancer>
            We are entrepreneurs, building the management platform we always needed
          </Balancer>
        </h1>
        <p className="about-description">
          Operations are changing every aspect of running a business, and it is
          happening now. <br /> Management is at the core of this revolution.
        </p>
      </section>
      <TeamGallery />
      <Benefits />
      <section aria-labelledby="vision-title" className="about-vision-section">
        <h2
          id="vision-title"
          className="about-vision-heading"
        >
          Our Vision
        </h2>
        <div className="about-vision-content">
          <p className="about-vision-paragraph">
            We envision a world where business management is no longer a complex
            challenge but a powerful advantage. By integrating cutting-edge AI
            into management solutions, we aim to transform daily operations into strategic
            assets, empowering businesses to innovate faster and more
            efficiently.
          </p>
          <p className="about-vision-paragraph">
            We believe in removing the barriers of operational complexity and
            scalability, enabling teams to focus on insights and innovations
            rather than maintenance and administration. Our goal is to equip every
            organization with the tools they need to harness the full potential
            of their business, driving growth and excellence in every interaction.
          </p>
          <p className="about-vision-signature">
            – Alex and Robin
          </p>
        </div>
      </section>
    </div>
  )
}
