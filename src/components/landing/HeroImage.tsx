"use client"

import ThemedImage from "./ThemedImage"

export default function HeroImage() {
  return (
    <section aria-label="Hero Image of the website" className="flow-root">
      <div className="rounded-2xl bg-muted/40 p-2 ring-1 ring-inset ring-border/50 dark:bg-card/70 dark:ring-border/20">
        <div className="rounded-xl bg-card ring-1 ring-border/5 dark:bg-card dark:ring-border/30">
          <ThemedImage
            lightSrc="/images/hero-light.webp"
            darkSrc="/images/hero-dark.webp"
            alt="A preview of the Database web app"
            width={2400}
            height={1600}
            className="rounded-xl shadow-2xl dark:shadow-primary/10"
          />
        </div>
      </div>
    </section>
  )
}
