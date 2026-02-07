const benefits = [
  {
    title: "Work in Zurich",
    description:
      "We are in-person first and have a fantastic office in Zurich.",
  },
  {
    title: "Competitive salary & equity",
    description:
      "We pay competitive salary and option packages to attract the very best talent.",
  },
  {
    title: "Health, dental, vision",
    description:
      "Database pays all of your health, dental, and vision insurance.",
  },
  {
    title: "Yearly off-sites",
    description:
      "We bring everyone together at an interesting location to discuss the big picture.",
  },
  {
    title: "Book budget",
    description:
      "We provide every employee with a 350 dollar budget for books.",
  },
  {
    title: "Tasty snacks",
    description:
      "The fridge and pantry are stocked + free dinner catered every night (incl. weekends).",
  },
  {
    title: "20 PTO days per year",
    description: "Take time off to recharge and come back refreshed.",
  },
  {
    title: "Spotify Premium",
    description:
      "We really have the best fringe benefits, even a Spotify subscription is included.",
  },
]

export default function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="benefits-section">
      <h2
        id="benefits-title"
        className="benefits-title"
      >
        What&rsquo;s in for you
      </h2>
      <dl className="benefits-grid">
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-item">
            <dt className="benefit-title">
              {benefit.title}
            </dt>
            <dd className="benefit-description">
              {benefit.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
