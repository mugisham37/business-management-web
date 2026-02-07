import { RiPlayCircleFill } from "@remixicon/react"
import Link from "next/link"
import { Button } from "../ui/Button"
import HeroImage from "./HeroImage"

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col items-center justify-center text-center"
      style={{ marginTop: 'var(--spacing-hero-top)' }}
    >
      <h1
        id="hero-title"
        className="heading-gradient animate-slide-up-fade p-2"
        style={{ 
          fontSize: 'var(--text-hero-sm)',
          lineHeight: 'var(--leading-hero)',
          animationDuration: "var(--animation-slide-up-fade-duration)"
        }}
      >
        Complete business <br /> management platform
      </h1>
      <p
        className="text-landing-body max-w-lg animate-slide-up-fade"
        style={{ 
          marginTop: 'var(--spacing-content-gap)',
          animationDuration: "900ms"
        }}
      >
        All-in-one solution for inventory, sales, customers, and finances built
        to scale from solo entrepreneur to enterprise operation.
      </p>
      <div
        className="mt-8 flex w-full animate-slide-up-fade flex-col justify-center gap-3 px-3 sm:flex-row"
        style={{ animationDuration: "1100ms" }}
      >
        <Button className="h-10 font-semibold">
          <Link href="#">Start 14-day trial</Link>
        </Button>
        <Button
          asChild
          variant="light"
          className="group gap-x-2 bg-transparent font-semibold hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
        >
          <Link
            href="https://www.youtube.com/watch?v=QRZ_l7cVzzU"
            className="ring-1 ring-border sm:ring-0"
            target="_blank"
          >
            <span className="mr-1 flex size-6 items-center justify-center rounded-full bg-muted transition-all group-hover:bg-muted/80">
              <RiPlayCircleFill
                aria-hidden="true"
                className="size-5 shrink-0 text-foreground"
              />
            </span>
            Watch video
          </Link>
        </Button>
      </div>
      <div
        className="relative mx-auto ml-3 h-fit w-[40rem] max-w-6xl animate-slide-up-fade sm:ml-auto sm:w-full sm:px-2"
        style={{ 
          marginTop: 'var(--spacing-gallery-top)',
          animationDuration: "1400ms"
        }}
      >
        <HeroImage />
        <div
          className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-background via-background to-transparent lg:h-1/4"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
