import React from "react"
import { Badge } from "../ui/Badge"

const stats = [
  {
    name: "Time saved on admin tasks",
    value: "+85%",
  },
  {
    name: "Order processing speed",
    value: "3x faster",
  },
  {
    name: "System uptime guarantee",
    value: "99.9%",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="features-section"
    >
      <Badge>Proven Results</Badge>
      <h2
        id="features-title"
        className="features-heading"
      >
        Built for efficiency and growth
      </h2>
      <p className="features-description">
        Our streamlined platform eliminates operational bottlenecks, helping businesses work smarter. Reduce manual tasks, improve accuracy, and scale confidently.
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
