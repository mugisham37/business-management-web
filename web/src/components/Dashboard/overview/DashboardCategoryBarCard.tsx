import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardFooter } from "@/components/ui/Card"
import { CategoryBar } from "@/components/ui/CategoryBar"
import { cx } from "@/lib/utils"
import { getColorClassName, AvailableChartColorsKeys } from "@/lib/chartUtils"

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
            <h3 className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
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
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              {value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {valueDescription}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
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
                <li key={item.title} className="flex items-center gap-2 text-xs">
                  <span
                    className={cx(
                      "size-2.5 rounded-sm flex-shrink-0",
                      getColorClassName(chartColors[index % chartColors.length], "bg")
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-gray-900 dark:text-gray-50 font-medium">
                    {item.title}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-auto">
                    {item.value} ({item.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <CardFooter className="px-0 pt-6 pb-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ctaDescription}{" "}
            <a 
              href={ctaLink} 
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
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
