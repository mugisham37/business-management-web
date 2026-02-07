"use client"
import Balancer from "react-wrap-balancer"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="cta-section"
    >
      <div className="cta-container">
        <div
          className="cta-mask"
          aria-hidden="true"
        >
          <div className="cta-mask-inner">
            {Array.from({ length: 20 }, (_, idx) => (
              <div key={`outer-${idx}`}>
                <div className="cta-mask-row">
                  {Array.from({ length: 41 }, (_, idx2) => (
                    <div key={`inner-${idx}-${idx2}`}>
                      <div className="cta-mask-cell"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cta-content-wrapper">
          <div className="cta-content-inner">
            <div>
              <h3
                id="cta-title"
                className="cta-heading"
              >
                Ready to transform your business?
              </h3>
              <p className="cta-description">
                <Balancer>
                  Start managing smarter today with a free trial—no credit card required.
                </Balancer>
              </p>
            </div>
            <div className="cta-form-outer">
              <div className="cta-form-inner">
                <form
                  className="cta-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label htmlFor="email" className="cta-label">
                    Email address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    id="email"
                    className="cta-input-wrapper"
                    inputClassName="cta-input"
                    placeholder="Your Work Email "
                  />
                  <Button
                    className="cta-button"
                    type="submit"
                    variant="primary"
                  >
                    Get started
                  </Button>
                </form>
              </div>
            </div>
            <p className="cta-footer-text">
              Need help choosing a plan?{" "}
              <a
                href="#"
                className="cta-footer-link"
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
