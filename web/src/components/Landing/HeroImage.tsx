"use client"

import ThemedImage from "./ThemedImage"

export default function HeroImage() {
  return (
    <section aria-label="Hero Image of the website" className="flow-root">
      <div 
        className="p-2 ring-1 ring-inset ring-border bg-muted/40"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div 
          className="bg-card ring-1 ring-border"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <ThemedImage
            lightSrc="/images/hero-light.webp"
            darkSrc="/images/hero-dark.webp"
            alt="A preview of the Database web app"
            width={2400}
            height={1600}
            className="shadow-2xl dark:shadow-primary/10"
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      </div>
    </section>
  )
}
