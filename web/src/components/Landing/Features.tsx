import React from "react"
import { Badge } from "../ui/Badge"

const stats = [
  {
    name: "Bandwith increase",
    value: "+162%",
  },
  {
    name: "Better storage efficiency",
    value: "2-3x",
  },
  {
    name: "Rows ingested / second",
    value: "Up to 9M",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="features-section"
    >
      <Badge>Security at Scale</Badge>
      <h2
        id="features-title"
        className="features-heading"
      >
        Architected for speed and reliability
      </h2>
      <p className="features-description">
        Database&rsquo; innovative architecture avoids the central bottlenecks
        of traditional systems, enhancing system reliability. This design
        ensures high productivity and security, minimizing the risk of service
        disruptions and outages.
      </p>
      <dl className="features-stats-grid">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="features-stat-item">
              <dd className="features-stat-value">
                {stat.value}
              </dd>
              <dt className="features-stat-name">
                {stat.name}
              </dt>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
