import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"

import { KpiEntry } from "@/app/dashboard/overview/page"

export type CardProps = {
  title: string
  change: string
  value: string
  valueDescription: string
  ctaDescription: string
  ctaText: string
  ctaLink: string
  data: KpiEntry[]
}

export function ProgressBarCard({
  title,
  change,
  value,
  valueDescription,
  ctaDescription,
  ctaText,
  ctaLink,
  data,
}: CardProps) {
  return (
    <>
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <dt className="font-bold text-foreground sm:text-sm">
              {title}
            </dt>
            <Badge variant="secondary">{change}</Badge>
          </div>
          <dd className="mt-2 flex items-baseline gap-2">
            <span className="text-xl text-foreground">
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{valueDescription}</span>
          </dd>
          <ul role="list" className="mt-4 space-y-5">
            {data.map((item) => (
              <li key={item.title}>
                <p className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="font-medium text-foreground">
                    {item.current}
                    <span className="font-normal text-muted-foreground">
                      /{item.allowed}
                      {item.unit}
                    </span>
                  </span>
                </p>
                <ProgressBar
                  value={item.percentage}
                  className="mt-2 [&>*]:h-1.5"
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mt-6 text-xs text-muted-foreground">
            {ctaDescription}{" "}
            <a href={ctaLink} className="text-primary hover:text-primary/80">
              {ctaText}
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
