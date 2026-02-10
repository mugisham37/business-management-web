import React from "react"
import { Badge } from "@/components/ui/badge"

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
      className="mx-auto mt-44 w-full max-w-6xl px-3"
    >
      <Badge>Security at Scale</Badge>
      <h2
        id="features-title"
        className="mt-2 inline-block bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl"
      >
        Architected for speed and reliability
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-7 text-muted-foreground">
        Database&rsquo; innovative architecture avoids the central bottlenecks
        of traditional systems, enhancing system reliability. This design
        ensures high productivity and security, minimizing the risk of service
        disruptions and outages.
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-border md:py-14">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="border-l-2 border-primary/20 pl-6 md:border-l md:text-center lg:border-border lg:first:border-none">
              <dd className="inline-block bg-gradient-to-t from-primary to-primary/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl">
                {stat.value}
              </dd>
              <dt className="mt-1 text-muted-foreground">
                {stat.name}
              </dt>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
