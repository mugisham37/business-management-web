const benefits = [
  {
    title: "Scales with your business",
    description:
      "From solo freelancer to enterprise operation, our platform grows with you.",
  },
  {
    title: "Multi-location ready",
    description:
      "Manage one storefront or hundreds of locations from a single dashboard.",
  },
  {
    title: "Complete inventory control",
    description:
      "Track every product movement with real-time visibility across all locations.",
  },
  {
    title: "Integrated point-of-sale",
    description:
      "Process sales seamlessly online and offline with automatic syncing.",
  },
  {
    title: "Customer relationships",
    description:
      "Build lasting connections with comprehensive CRM and loyalty programs.",
  },
  {
    title: "Financial clarity",
    description:
      "Know exactly where your business stands with real-time financial insights.",
  },
  {
    title: "Team management",
    description: "Handle scheduling, time tracking, and permissions effortlessly.",
  },
  {
    title: "Enterprise security",
    description:
      "Bank-level encryption and multi-factor authentication protect your data.",
  },
]

export default function Benefits() {
  return (
    <section 
      aria-labelledby="benefits-title" 
      className="mx-auto"
      style={{ marginTop: 'var(--spacing-section-top-sm)' }}
    >
      <h2
        id="benefits-title"
        className="heading-gradient-top"
        style={{ 
          fontSize: 'var(--text-section-heading)',
          lineHeight: 'var(--leading-section)'
        }}
      >
        What&rsquo;s included
      </h2>
      <dl className="mt-8 grid grid-cols-4 gap-x-10 gap-y-8 sm:mt-12 sm:gap-y-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="col-span-4 sm:col-span-2 lg:col-span-1">
            <dt className="text-foreground font-semibold">
              {benefit.title}
            </dt>
            <dd className="text-landing-body mt-2 leading-7">
              {benefit.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
