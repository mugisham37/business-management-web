import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardFooter } from "@/components/ui/Card"
import { CategoryBar } from "@/components/ui/CategoryBar"
import { cx } from "@/lib/utils"
import { getColorClassName, AvailableChartColorsKeys } from "@/lib/chartUtils"

import type { KpiEntryExtended } from "@/app/(dashboard)/dashboard/overview/page"

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
  variant?: "default" | "compact"
  showCategoryBar?: boolean
  changeVariant?: "neutral" | "success" | "error" | "warning"
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
  showCategoryBar = true,
  changeVariant = "neutral",
}: CardProps) {
  const chartColors: AvailableChartColorsKeys[] = ["indigo", "violet", "gray"]
  const categoryBarValues = data.map(item => item.percentage)
  
  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case "success": return "success"
      case "error": return "error" 
      case "warning": return "warning"
      default: return "neutral"
    }
  }

  return (
    <Card variant="tremor" className="h-full">
      <CardContent className="flex flex-col justify-between h-full p-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="card-title-overview">
              {title}
            </h3>
            <Badge 
              variant={getBadgeVariant(changeVariant)}
              size="sm"
              aria-label={`Change: ${change}`}
            >
              {change}
            </Badge>
          </div>
          
          <div className="mt-2 flex items-baseline gap-2">
            <span className="card-value-overview">
              {value}
            </span>
            <span className="card-description-overview">
              {valueDescription}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="card-title-overview mb-3">
              {subtitle}
            </p>
            
            {showCategoryBar && data.length > 0 && (
              <div className="mb-4">
                <CategoryBar
                  values={categoryBarValues}
                  colors={chartColors}
                  showLabels={false}
                  className="mb-3"
                  aria-label={`${title} distribution`}
                />
              </div>
            )}
            
            <ul role="list" className="space-y-2" aria-label={`${title} breakdown`}>
              {data.map((item, index) => (
                <li key={item.title} className="category-legend-item">
                  <span
                    className={cx(
                      "category-legend-indicator",
                      getColorClassName(chartColors[index % chartColors.length], "bg")
                    )}
                    aria-hidden="true"
                  />
                  <span className="category-legend-title">
                    {item.title}
                  </span>
                  <span className="category-legend-value">
                    {item.value} ({item.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <CardFooter className="px-0 pt-6 pb-0">
          <p className="card-footer-text">
            {ctaDescription}{" "}
            <a 
              href={ctaLink} 
              className="card-footer-link"
              aria-label={`${ctaText} - ${ctaDescription}`}
            >
              {ctaText}
            </a>
          </p>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
