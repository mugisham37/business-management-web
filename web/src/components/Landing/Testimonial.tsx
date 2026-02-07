import Image from "next/image"
import Balancer from "react-wrap-balancer"

export default function Testimonial() {
  return (
    <section id="testimonial" aria-label="Testimonial">
      <figure className="mx-auto">
        <blockquote className="text-foreground mx-auto max-w-2xl text-center font-semibold leading-8"
          style={{ 
            fontSize: 'var(--text-xl)',
            lineHeight: 'var(--leading-relaxed)'
          }}
        >
          <p>
            <Balancer>
              "Thanks to this robust database solution, our organization has
              streamlined data management processes, leading to increased
              efficiency and accuracy in our operations."
            </Balancer>
          </p>
        </blockquote>
        <figcaption className="mt-10 flex items-center justify-center gap-x-5">
          <Image
            className="h-11 w-11 rounded-full object-cover shadow-lg shadow-primary/50 ring-2 ring-card"
            width={200}
            height={200}
            src="/images/testimonial.webp"
            alt="Image of Dima Coil"
          />
          <div>
            <p className="text-foreground font-semibold">
              Dima Coil
            </p>
            <p className="text-landing-body text-sm">
              CEO Hornertools
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
