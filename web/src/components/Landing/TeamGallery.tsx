import { InstaxImage } from "./InstaxImage"

export default function TeamGallery() {
  return (
    <section
      aria-labelledby="teamwork-title"
      className="mx-auto max-w-4xl animate-slide-up-fade"
      style={{
        marginTop: 'var(--spacing-gallery-top)',
        animationDuration: "var(--animation-slide-up-fade-duration)",
        animationDelay: "var(--animation-slide-up-fade-delay)",
        animationFillMode: "var(--animation-fill-mode)",
      }}
    >
      <div style={{ marginTop: 'var(--spacing-gallery-top)' }}>
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-[25rem] sm:-ml-10"
            style={{ transform: 'rotate(var(--rotate-slight-left))' }}
            src="/images/working.webp"
            alt="Two employees working with computers"
            width={640}
            height={427}
            caption="Managing operations from anywhere"
          />
          <InstaxImage
            className="w-[15rem]"
            style={{ transform: 'rotate(var(--rotate-slight-right))' }}
            src="/images/workplace.webp"
            alt="Office with a phone booth"
            width={640}
            height={853}
            caption="Built for modern workplaces"
          />
          <InstaxImage
            className="-mr-10 w-[15rem]"
            style={{ transform: 'rotate(1deg)' }}
            src="/images/home.webp"
            alt="Picture of the Fraumunster Zurich"
            width={640}
            height={960}
            caption="Your business, your way"
          />
        </div>
        <div className="hidden w-full justify-between gap-4 md:flex" style={{ marginTop: 'var(--spacing-gallery-row)' }}>
          <InstaxImage
            className="-ml-16 w-[25rem]"
            style={{ transform: 'rotate(1deg)' }}
            src="/images/break.webp"
            alt="Team having a break in the lunch room"
            width={640}
            height={360}
            caption="Real-time insights for better decisions"
          />
          <InstaxImage
            className="-mt-10 w-[15rem]"
            style={{ transform: 'rotate(var(--rotate-slight-right))' }}
            src="/images/cool.webp"
            alt="Personw with headphones"
            width={640}
            height={965}
            caption="Seamless team collaboration"
          />
          <InstaxImage
            className="-mr-20 -mt-2 w-[30rem]"
            style={{ transform: 'rotate(var(--rotate-medium))' }}
            src="/images/release.webp"
            alt="Picture of a party with confetti"
            width={1920}
            height={1281}
            caption="Celebrating milestones together. Our first customer hit $1M in sales using our platform"
          />
        </div>
      </div>
      <div style={{ marginTop: 'var(--spacing-gallery-final)' }}>
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-full"
            style={{ transform: 'rotate(1deg)' }}
            src="/images/founders.webp"
            alt="Join us, grow your business."
            width={1819}
            height={998}
            caption="Join us, grow your business."
          />
        </div>
      </div>
    </section>
  )
}
