import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"

import { KpiEntry } from "@/app/dashboard/(main)/overview/page"

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
            className="font-bold text-gray-900 sm:text-sm dark:text-gray-50"
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
          <span className="text-xl text-gray-900 dark:text-gray-50">
            {value}
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </dd>
        <ul role="list" className="mt-4 space-y-5" aria-label={`${title} metrics`}>
          {data.map((item) => {
            const progressVariant = getProgressVariant(item.percentage)
            return (
              <li key={item.title}>
                <div className="flex justify-between text-sm" role="group" aria-labelledby={`${item.title.toLowerCase().replace(/\s+/g, '-')}-label`}>
                  <span 
                    id={`${item.title.toLowerCase().replace(/\s+/g, '-')}-label`}
                    className="font-medium text-gray-900 dark:text-gray-50"
                  >
                    {item.title}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {item.current}
                    <span className="font-normal text-gray-500">
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
        <p className="mt-6 text-xs text-gray-500">
          {ctaDescription}{" "}
          <a 
            href={ctaLink} 
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-sm"
            aria-label={`${ctaText} - ${ctaDescription}`}
          >
            {ctaText}
          </a>
        </p>
      </footer>
    </article>
  )
}
