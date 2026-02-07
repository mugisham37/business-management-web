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
            caption="At Database we use computers"
          />
          <InstaxImage
            className="w-[15rem]"
            style={{ transform: 'rotate(var(--rotate-slight-right))' }}
            src="/images/workplace.webp"
            alt="Office with a phone booth"
            width={640}
            height={853}
            caption="Our phone booths are nuts"
          />
          <InstaxImage
            className="-mr-10 w-[15rem]"
            style={{ transform: 'rotate(1deg)' }}
            src="/images/home.webp"
            alt="Picture of the Fraumunster Zurich"
            width={640}
            height={960}
            caption="Home sweet home"
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
            caption="Sometimes we take a break"
          />
          <InstaxImage
            className="-mt-10 w-[15rem]"
            style={{ transform: 'rotate(var(--rotate-slight-right))' }}
            src="/images/cool.webp"
            alt="Personw with headphones"
            width={640}
            height={965}
            caption="Robin handels the playlist"
          />
          <InstaxImage
            className="-mr-20 -mt-2 w-[30rem]"
            style={{ transform: 'rotate(var(--rotate-medium))' }}
            src="/images/release.webp"
            alt="Picture of a party with confetti"
            width={1920}
            height={1281}
            caption="v1.0 Release party. Our US intern, Mike, had his first alcohol-free beer"
          />
        </div>
      </div>
      <div style={{ marginTop: 'var(--spacing-gallery-final)' }}>
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <InstaxImage
            className="w-full"
            style={{ transform: 'rotate(1deg)' }}
            src="/images/founders.webp"
            alt=" Join Database, be yourself."
            width={1819}
            height={998}
            caption=" Join Database, be yourself."
          />
        </div>
      </div>
    </section>
  )
}
