import React from "react"
import { Badge } from "../ui/Badge"

const stats = [
  {
    name: "Average efficiency gain",
    value: "+162%",
  },
  {
    name: "Faster operations",
    value: "2-3x",
  },
  {
    name: "Transactions processed daily",
    value: "Up to 9M",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="mx-auto w-full max-w-6xl px-3"
      style={{ marginTop: 'var(--spacing-section-top)' }}
    >
      <Badge>Security at Scale</Badge>
      <h2
        id="features-title"
        className="heading-gradient mt-2"
        style={{ 
          fontSize: 'var(--text-section-heading)',
          lineHeight: 'var(--leading-section)'
        }}
      >
        Built for reliability and growth
      </h2>
      <p className="text-landing-body max-w-3xl leading-7" style={{ marginTop: 'var(--spacing-content-gap)' }}>
        Our multi-tenant architecture ensures complete data isolation while
        delivering enterprise-grade performance. This design guarantees your
        business operations run smoothly with bank-level security, minimizing
        downtime and protecting every transaction.
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-border md:py-14">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="border-l-2 border-primary/20 pl-6 md:border-l md:text-center lg:border-border lg:first:border-none">
              <dd className="inline-block bg-gradient-to-t from-primary/90 to-primary bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl">
                {stat.value}
              </dd>
              <dt className="text-landing-body mt-1">
                {stat.name}
              </dt>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
