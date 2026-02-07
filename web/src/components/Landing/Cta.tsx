"use client"
import { useState } from "react"
import Link from "next/link"
import Balancer from "react-wrap-balancer"
import { Button } from "../ui/Button"
import ContactModal from "./ContactModal"

export default function Cta() {
  const [contactModalOpen, setContactModalOpen] = useState(false)

  return (
    <>
      <ContactModal 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
      />
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
              <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row">
                <Button
                  className="h-12 w-full px-8 sm:w-fit"
                  asChild
                >
                  <Link href="/auth/login" className="hidden h-10 font-semibold md:flex">
                    Get started
                  </Link>
                </Button>
      
              </div>
              <p className="text-landing-body mt-6 text-xs sm:text-sm">
                Not sure where to start?{" "}
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Contact our team
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
