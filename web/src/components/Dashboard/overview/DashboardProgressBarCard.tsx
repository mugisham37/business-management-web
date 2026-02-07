import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"

import { KpiEntry } from "@/app/(dashboard)/dashboard/overview/page"

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

const getBadgeVariant = (change: string) => {
  const numericChange = parseFloat(change.replace(/[^-\d.]/g, ''))
  if (numericChange > 0) return "success"
  if (numericChange < 0) return "error"
  return "neutral"
}

const getProgressVariant = (percentage: number) => {
  if (percentage >= 90) return "error"
  if (percentage >= 75) return "warning"
  if (percentage >= 50) return "default"
  return "success"
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
  const badgeVariant = getBadgeVariant(change)

  return (
    <article className="flex flex-col justify-between" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}>
      <div>
        <header className="flex items-center gap-2">
          <dt 
            id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
            className="card-title-overview"
          >
            {title}
          </dt>
          <Badge 
            variant={badgeVariant}
            size="sm"
            aria-label={`Change: ${change}`}
          >
            {change}
          </Badge>
        </header>
        <dd className="mt-2 flex items-baseline gap-2">
          <span className="card-value-overview">
            {value}
          </span>
          <span className="card-description-overview">{valueDescription}</span>
        </dd>
        <ul role="list" className="mt-4 space-y-5" aria-label={`${title} metrics`}>
          {data.map((item) => {
            const progressVariant = getProgressVariant(item.percentage)
            return (
              <li key={item.title}>
                <div className="progress-label" role="group" aria-labelledby={`${item.title.toLowerCase().replace(/\s+/g, '-')}-label`}>
                  <span 
                    id={`${item.title.toLowerCase().replace(/\s+/g, '-')}-label`}
                    className="progress-label-title"
                  >
                    {item.title}
                  </span>
                  <span className="progress-label-value">
                    {item.current}
                    <span className="progress-label-unit">
                      /{item.allowed}
                      {item.unit}
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={item.percentage}
                  max={100}
                  variant={progressVariant}
                  size="sm"
                  showAnimation={true}
                  formatLabel={(value) => `${Math.round(value)}%`}
                  className="mt-2"
                  aria-label={`${item.title}: ${Math.round(item.percentage)}% of ${item.allowed}${item.unit || ''}`}
                />
              </li>
            )
          })}
        </ul>
      </div>
      <footer>
        <p className="mt-6 card-footer-text">
          {ctaDescription}{" "}
          <a 
            href={ctaLink} 
            className="card-footer-link"
            aria-label={`${ctaText} - ${ctaDescription}`}
          >
            {ctaText}
          </a>
        </p>
      </footer>
    </article>
  )
}
