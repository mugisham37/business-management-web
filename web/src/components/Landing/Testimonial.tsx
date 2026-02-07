import Image from "next/image"
import Balancer from "react-wrap-balancer"

export default function Testimonial() {
  return (
    <section id="testimonial" aria-label="Testimonial">
      <figure className="testimonial-figure">
        <blockquote className="testimonial-blockquote">
          <p>
            <Balancer>
              "This platform transformed how we run our business. We've cut admin time in half and can now focus on growth instead of paperwork."
            </Balancer>
          </p>
        </blockquote>
        <figcaption className="testimonial-figcaption">
          <Image
            className="testimonial-image"
            width={200}
            height={200}
            src="/images/testimonial.webp"
            alt="Image of Dima Coil"
          />
          <div>
            <p className="testimonial-name">
              Dima Coil
            </p>
            <p className="testimonial-title">
              CEO, Hornertools
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
