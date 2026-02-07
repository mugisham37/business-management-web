import { RiPlayCircleFill } from "@remixicon/react"
import Link from "next/link"
import { Button } from "../ui/Button"
import HeroImage from "./HeroImage"

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero-section"
    >
      <h1
        id="hero-title"
        className="hero-title"
      >
        The database for <br /> modern applications
      </h1>
      <p
        className="hero-description"
      >
        Database is a general purpose, relational database built for modern
        application developers and for the cloud era.
      </p>
      <div
        className="hero-buttons-container"
      >
        <Button className="hero-button-primary">
          <Link href="#">Start 14-day trial</Link>
        </Button>
        <Button
          asChild
          variant="light"
          className="hero-button-secondary"
        >
          <Link
            href="https://www.youtube.com/watch?v=QRZ_l7cVzzU"
            className="hero-button-secondary-link"
            target="_blank"
          >
            <span className="hero-play-icon-wrapper">
              <RiPlayCircleFill
                aria-hidden="true"
                className="hero-play-icon"
              />
            </span>
            Watch video
          </Link>
        </Button>
      </div>
      <div
        className="hero-image-container"
      >
        <HeroImage />
        <div
          className="hero-gradient-overlay"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
