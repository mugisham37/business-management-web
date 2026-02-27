import { PeriodValue } from "@/app/dashboard/(main)/overview/page"
import { Badge } from "@/components/ui/badge"
import { LineChart } from "@/components/ui/line-chart"
import { overviews } from "@/data/overview-data"
import { OverviewData } from "@/data/schema"
import { cx, formatters, percentageFormatter } from "@/lib/utils"
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns"
import { DateRange } from "react-day-picker"
import { getPeriod } from "./DashboardFilterbar"

export type CardProps = {
  title: keyof OverviewData
  type: "currency" | "unit"
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
}

const formattingMap = {
  currency: formatters.currency,
  unit: formatters.unit,
}

export const getBadgeType = (value: number): "primary-light" | "accent-light" | "destructive-light" | "muted-light" => {
  if (value > 0) {
    return "primary-light" // success -> primary-light (green-ish)
  } else if (value < 0) {
    if (value < -50) {
      return "accent-light" // warning -> accent-light (yellow-ish)
    }
    return "destructive-light" // error -> destructive-light (red)
  } else {
    return "muted-light" // neutral -> muted-light (gray)
  }
}

export function ChartCard({
  title,
  type,
  selectedDates,
  selectedPeriod,
  isThumbnail,
}: CardProps) {
  const formatter = formattingMap[type]
  const selectedDatesInterval =
    selectedDates?.from && selectedDates?.to
      ? interval(selectedDates.from, selectedDates.to)
      : null
  const allDatesInInterval =
    selectedDates?.from && selectedDates?.to
      ? eachDayOfInterval(interval(selectedDates.from, selectedDates.to))
      : null
  const prevDates = getPeriod(selectedDates, selectedPeriod)

  const prevDatesInterval =
    prevDates?.from && prevDates?.to
      ? interval(prevDates.from, prevDates.to)
      : null

  const data = overviews
    .filter((overview) => {
      if (selectedDatesInterval) {
        return isWithinInterval(overview.date, selectedDatesInterval)
      }
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prevData = overviews
    .filter((overview) => {
      if (prevDatesInterval) {
        return isWithinInterval(overview.date, prevDatesInterval)
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = allDatesInInterval
    ?.map((date, index) => {
      const overview = data[index]
      const prevOverview = prevData[index]
      const value = (overview?.[title] as number) || null
      const previousValue = (prevOverview?.[title] as number) || null

      return {
        title,
        date: date,
        formattedDate: formatDate(date, "dd/MM/yyyy"),
        value,
        previousDate: prevOverview?.date,
        previousFormattedDate: prevOverview
          ? formatDate(prevOverview.date, "dd/MM/yyyy")
          : null,
        previousValue:
          selectedPeriod !== "no-comparison" ? previousValue : null,
        evolution:
          selectedPeriod !== "no-comparison" && value && previousValue
            ? (value - previousValue) / previousValue
            : undefined,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"]
  const value =
    chartData?.reduce((acc, item) => acc + (item.value || 0), 0) || 0
  const previousValue =
    chartData?.reduce((acc, item) => acc + (item.previousValue || 0), 0) || 0
  const evolution =
    selectedPeriod !== "no-comparison"
      ? (value - previousValue) / previousValue
      : 0

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-foreground sm:text-sm">
            {title}
          </dt>
          {selectedPeriod !== "no-comparison" && (
            <Badge variant={getBadgeType(evolution)}>
              {percentageFormatter(evolution)}
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-foreground">
          {formatter(value)}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-muted-foreground">
            from {formatter(previousValue)}
          </dd>
        )}
      </div>
      <LineChart
        className="mt-6 h-32"
        data={chartData || []}
        index="formattedDate"
        colors={["chart1", "chart2"]}
        startEndOnly={true}
        valueFormatter={(value) => formatter(value as number)}
        showYAxis={false}
        showLegend={false}
        categories={categories}
        showTooltip={isThumbnail ? false : true}
        autoMinValue
      />
    </div>
  )
}
