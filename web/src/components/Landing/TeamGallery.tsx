import { InstaxImage } from "./InstaxImage"

export default function TeamGallery() {
  return (
    <section
      aria-labelledby="teamwork-title"
      className="team-gallery-section"
    >
      <div className="team-gallery-first-row-wrapper">
        <div className="team-gallery-first-row">
          <InstaxImage
            className="team-gallery-image-1"
            src="/images/working.webp"
            alt="Two employees working with computers"
            width={640}
            height={427}
            caption="At Database we use computers"
          />
          <InstaxImage
            className="team-gallery-image-2"
            src="/images/workplace.webp"
            alt="Office with a phone booth"
            width={640}
            height={853}
            caption="Our phone booths are nuts"
          />
          <InstaxImage
            className="team-gallery-image-3"
            src="/images/home.webp"
            alt="Picture of the Fraumunster Zurich"
            width={640}
            height={960}
            caption="Home sweet home"
          />
        </div>
        <div className="team-gallery-second-row">
          <InstaxImage
            className="team-gallery-image-4"
            src="/images/break.webp"
            alt="Team having a break in the lunch room"
            width={640}
            height={360}
            caption="Sometimes we take a break"
          />
          <InstaxImage
            className="team-gallery-image-5"
            src="/images/cool.webp"
            alt="Personw with headphones"
            width={640}
            height={965}
            caption="Robin handels the playlist"
          />
          <InstaxImage
            className="team-gallery-image-6"
            src="/images/release.webp"
            alt="Picture of a party with confetti"
            width={1920}
            height={1281}
            caption="v1.0 Release party. Our US intern, Mike, had his first alcohol-free beer"
          />
        </div>
      </div>
      <div className="team-gallery-third-section-wrapper">
        <div className="team-gallery-third-row">
          <InstaxImage
            className="team-gallery-image-7"
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
