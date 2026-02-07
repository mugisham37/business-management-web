import Image from "next/image"
import Balancer from "react-wrap-balancer"

export default function Testimonial() {
  return (
    <section id="testimonial" aria-label="Testimonial">
      <figure className="testimonial-figure">
        <blockquote className="testimonial-blockquote">
          <p>
            <Balancer>
              "Thanks to this robust database solution, our organization has
              streamlined data management processes, leading to increased
              efficiency and accuracy in our operations."
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
              CEO Hornertools
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
