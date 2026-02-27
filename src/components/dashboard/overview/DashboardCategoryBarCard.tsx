import { Badge } from "@/components/ui/badge"
import { cx } from "@/lib/utils"

import type { KpiEntryExtended } from "@/app/dashboard/(main)/overview/page"

export type CardProps = {
  title: string
  change: string
  value: string
  valueDescription: string
  subtitle: string
  ctaDescription: string
  ctaText: string
  ctaLink: string
  data: KpiEntryExtended[]
}

export function CategoryBarCard({
  title,
  change,
  value,
  valueDescription,
  subtitle,
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
            <h3 className="font-bold text-foreground sm:text-sm">
              {title}
            </h3>
            <Badge variant="muted">{change}</Badge>
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-xl text-foreground">
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{valueDescription}</span>
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">
              {subtitle}
            </p>
            <div className="mt-2 flex items-center gap-0.5">
              {data.map((item) => (
                <div
                  key={item.title}
                  className={cx(item.color, `h-1.5 rounded-full`)}
                  style={{ width: `${item.percentage}%` }}
                />
              ))}
            </div>
          </div>
          <ul role="list" className="mt-5 space-y-2">
            {data.map((item) => (
              <li key={item.title} className="flex items-center gap-2 text-xs">
                <span
                  className={cx(item.color, "size-2.5 rounded-sm")}
                  aria-hidden="true"
                />
                <span className="text-foreground">
                  {item.title}
                </span>
                <span className="text-muted-foreground">
                  ({item.value} / {item.percentage}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {ctaDescription}{" "}
          <a href={ctaLink} className="text-primary hover:underline">
            {ctaText}
          </a>
        </p>
      </div>
    </>
  )
}
