"use client"
import Balancer from "react-wrap-balancer"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="mx-auto mb-20 max-w-6xl p-1 px-2"
      style={{ marginTop: 'var(--spacing-section-top)' }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="mask pointer-events-none absolute -z-10 select-none opacity-70"
          aria-hidden="true"
        >
          <div className="flex size-full flex-col gap-2">
            {Array.from({ length: 20 }, (_, idx) => (
              <div key={`outer-${idx}`}>
                <div className="flex size-full gap-2">
                  {Array.from({ length: 41 }, (_, idx2) => (
                    <div key={`inner-${idx}-${idx2}`}>
                      <div className="size-5 rounded-md shadow shadow-primary/20 ring-1 ring-border"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-4xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div>
              <h3
                id="cta-title"
                className="heading-gradient-top p-2"
                style={{ 
                  fontSize: 'var(--text-hero-sm)',
                  lineHeight: 'var(--leading-hero)'
                }}
              >
                Ready to get started?
              </h3>
              <p className="text-landing-body mx-auto max-w-2xl sm:text-lg" style={{ marginTop: 'var(--spacing-xs)' }}>
                <Balancer>
                  Launch a new cluster or migrate to Database with zero
                  downtime.
                </Balancer>
              </p>
            </div>
            <div className="mt-14 w-full rounded-[16px] bg-muted/5 p-1.5 ring-1 ring-border backdrop-blur">
              <div className="rounded-xl bg-card p-4 shadow-lg shadow-primary/10 ring-1 ring-border">
                <form
                  className="flex flex-col items-center gap-3 sm:flex-row"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    id="email"
                    className="h-10 w-full min-w-0 flex-auto"
                    inputClassName="h-full"
                    placeholder="Your Work Email "
                  />
                  <Button
                    className="h-10 w-full sm:w-fit sm:flex-none"
                    type="submit"
                    variant="primary"
                  >
                    Get started
                  </Button>
                </form>
              </div>
            </div>
            <p className="text-landing-body mt-4 text-xs sm:text-sm">
              Not sure where to start?{" "}
              <a
                href="#"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Talk to sales
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
