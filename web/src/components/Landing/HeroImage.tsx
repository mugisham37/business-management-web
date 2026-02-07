"use client"

import ThemedImage from "./ThemedImage"

export default function HeroImage() {
  return (
    <section aria-label="Hero Image of the website" className="hero-image-section">
      <div className="hero-image-outer-wrapper">
        <div className="hero-image-inner-wrapper">
          <ThemedImage
            lightSrc="/images/hero-light.webp"
            darkSrc="/images/hero-dark.webp"
            alt="A preview of the Database web app"
            width={2400}
            height={1600}
            className="hero-image-img"
          />
        </div>
      </div>
    </section>
  )
}
