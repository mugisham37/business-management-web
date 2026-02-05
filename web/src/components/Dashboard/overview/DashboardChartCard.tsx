import { PeriodValue } from "@/app/dashboard/main/overview/page"
import { Badge } from "@/components/ui/Badge"
import { LineChart } from "@/components/ui/LineChart"
import { overviews } from "@/data/overview-data"
import { OverviewData } from "@/data/schema"
import { cx, formatters, isValidNumber, safeFormat } from "@/lib/utils"
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
  currency: (value: number) => formatters.currency({ number: value }),
  unit: (value: number) => formatters.unit({ number: value }),
}

export const getBadgeType = (value: number): "success" | "error" | "warning" | "neutral" => {
  if (!isValidNumber(value)) return "neutral"
  
  if (value > 0) {
    return "success"
  } else if (value < 0) {
    if (value < -50) {
      return "warning"
    }
    return "error"
  } else {
    return "neutral"
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
          selectedPeriod !== "no-comparison" && 
          isValidNumber(value) && 
          isValidNumber(previousValue) && 
          previousValue !== 0
            ? (value - previousValue) / previousValue
            : undefined,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"]
    
  const value =
    chartData?.reduce((acc, item) => acc + (isValidNumber(item.value) ? item.value : 0), 0) || 0
    
  const previousValue =
    chartData?.reduce((acc, item) => acc + (isValidNumber(item.previousValue) ? item.previousValue : 0), 0) || 0
    
  const evolution =
    selectedPeriod !== "no-comparison" && isValidNumber(previousValue) && previousValue !== 0
      ? (value - previousValue) / previousValue
      : 0

  const formatValue = (val: number) => safeFormat(val, formatter, "N/A")
  const formatPercentage = (val: number) => 
    safeFormat(val, (v) => formatters.percentage({ number: v, decimals: 1, showSign: true }), "0.0%")

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
          {selectedPeriod !== "no-comparison" && isValidNumber(evolution) && (
            <Badge variant={getBadgeType(evolution)}>
              {formatPercentage(evolution)}
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-gray-900 dark:text-gray-50">
          {formatValue(value)}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from {formatValue(previousValue)}
          </dd>
        )}
      </div>
      <LineChart
        className="mt-6 h-32"
        data={chartData || []}
        index="formattedDate"
        colors={["indigo", "gray"]}
        startEndOnly={true}
        valueFormatter={formatValue}
        showYAxis={false}
        showLegend={false}
        categories={categories}
        showTooltip={isThumbnail ? false : true}
        useOverviewTooltip={true}
        autoMinValue
        connectNulls={false}
        allowDecimals={type === "currency"}
        intervalType="preserveStartEnd"
        enableLegendSlider={false}
        tickGap={5}
      />
    </div>
  )
}
