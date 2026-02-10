"use client"
import { BarChart } from "@/components/ui/bar-chart"
import { Button } from "@/components/ui/button"
import { ComboChart } from "@/components/ui/combo-chart"
import { ConditionalBarChart } from "@/components/ui/conditional-bar-chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatters } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"

// Mock data - replace with actual data source
const dataChart = [
  { date: "Jan", "Current year": 120, "Same period last year": 100 },
  { date: "Feb", "Current year": 150, "Same period last year": 130 },
]
const dataChart2 = [
  { date: "Jan", Quotes: 50, "Total deal size": 250000 },
  { date: "Feb", Quotes: 65, "Total deal size": 320000 },
]
const dataChart3 = [
  { date: "Jan", Addressed: 75, Unrealized: 25 },
  { date: "Feb", Addressed: 80, Unrealized: 20 },
]
const dataChart4 = [
  { date: "Jan", Density: 65 },
  { date: "Feb", Density: 72 },
]

export default function Monitoring() {
  return (
    <section aria-label="App Monitoring">
      <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
        <Select defaultValue="365-days">
          <SelectTrigger className="py-1.5 sm:w-44">
            <SelectValue placeholder="Assigned to..." />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="30-days">Last 30 days</SelectItem>
            <SelectItem value="90-days">Last 90 days</SelectItem>
            <SelectItem value="180-days">Last 180 days</SelectItem>
            <SelectItem value="365-days">Last 365 days</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
        >
          <SlidersHorizontal
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Report Filters
        </Button>
      </div>
      <dl className="grid grid-cols-1 gap-x-14 gap-y-10 border-t border-gray-200 p-6 md:grid-cols-2 dark:border-gray-800">
        <div className="flex flex-col justify-between p-0">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Inherent risk
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Risk scenarios over time grouped by risk level
            </dd>
          </div>
          <BarChart
            data={dataChart}
            index="date"
            categories={["Current year", "Same period last year"]}
            colors={["blue", "gray"]}
            yAxisWidth={45}
            yAxisLabel="Number of inherent risks"
            barCategoryGap="20%"
            valueFormatter={(value: number) => formatters.unit(value)}
            className="mt-4 hidden h-60 md:block"
          />
          <BarChart
            data={dataChart}
            index="date"
            categories={["Current year", "Same period last year"]}
            colors={["blue", "gray"]}
            showYAxis={false}
            barCategoryGap="20%"
            className="mt-4 h-60 md:hidden"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Quote-to-Deal ratio
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Number of quotes compared to total deal size for given month
            </dd>
          </div>
          <ComboChart
            data={dataChart2}
            index="date"
            enableBiaxial={true}
            barSeries={{
              categories: ["Quotes"],
              yAxisLabel: "Number of quotes / Deal size ($)",
              valueFormatter: (value: number) =>
                formatters.currency({ number: value, maxFractionDigits: 0 }),
            }}
            lineSeries={{
              categories: ["Total deal size"],
              colors: ["gray"],
              showYAxis: false,
            }}
            className="mt-4 hidden h-60 md:block"
          />
          <ComboChart
            data={dataChart2}
            index="date"
            enableBiaxial={true}
            barSeries={{
              categories: ["Quotes"],
              showYAxis: false,
            }}
            lineSeries={{
              categories: ["Total deal size"],
              colors: ["gray"],
              showYAxis: false,
            }}
            className="mt-4 h-60 md:hidden"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              ESG impact
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Evaluation of addressed ESG criteria in biddings over time
            </dd>
          </div>
          <BarChart
            data={dataChart3}
            index="date"
            categories={["Addressed", "Unrealized"]}
            colors={["emerald", "gray"]}
            type="percent"
            yAxisWidth={55}
            yAxisLabel="% of criteria addressed"
            barCategoryGap="30%"
            className="mt-4 hidden h-60 md:block"
          />
          <BarChart
            data={dataChart3}
            index="date"
            categories={["Addressed", "Unrealized"]}
            colors={["emerald", "gray"]}
            showYAxis={false}
            type="percent"
            barCategoryGap="30%"
            className="mt-4 h-60 md:hidden"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Bidder density
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Competition level measured by number and size of bidders over time
            </dd>
          </div>
          <ConditionalBarChart
            data={dataChart4}
            index="date"
            categories={["Density"]}
            colors={["amber"]}
            valueFormatter={(value: number) =>
              formatters.percentage({ number: value })
            }
            yAxisWidth={55}
            yAxisLabel="Competition density (%)"
            barCategoryGap="30%"
            className="mt-4 hidden h-60 md:block"
          />
          <ConditionalBarChart
            data={dataChart4}
            index="date"
            categories={["Density"]}
            colors={["amber"]}
            valueFormatter={(value: number) =>
              formatters.percentage({ number: value })
            }
            showYAxis={false}
            barCategoryGap="30%"
            className="mt-4 h-60 md:hidden"
          />
        </div>
      </dl>
    </section>
  )
}
