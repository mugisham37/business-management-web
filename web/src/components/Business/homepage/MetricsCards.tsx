"use client"

import React from "react"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Tooltip } from "@/components/ui/Tooltip"
import { getColorClassName, type AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx } from "@/lib/utils"

type MetricStatus = "critical" | "warning" | "good" | "excellent"
type Metric = {
  label: string
  value: number
  percentage: string
  fraction: string
  target?: number
  trend?: "up" | "down" | "stable"
  description?: string
}

const getMetricStatus = (value: number): MetricStatus => {
  if (value < 0.3) return "critical"
  if (value < 0.5) return "warning"
  if (value < 0.8) return "good"
  return "excellent"
}

const getStatusColor = (status: MetricStatus): AvailableChartColorsKeys => {
  switch (status) {
    case "critical": return "red"
    case "warning": return "orange"
    case "good": return "emerald"
    case "excellent": return "blue"
  }
}

const getStatusVariant = (status: MetricStatus) => {
  switch (status) {
    case "critical": return "error"
    case "warning": return "warning"
    case "good": return "success"
    case "excellent": return "success"
  }
}

const getProgressVariant = (status: MetricStatus) => {
  switch (status) {
    case "critical": return "error"
    case "warning": return "warning"
    case "good": return "success"
    case "excellent": return "success"
  }
}

function StatusIndicator({ value, showAnimation = true }: { value: number; showAnimation?: boolean }) {
  const status = getMetricStatus(value)
  const color = getStatusColor(status)
  const inactiveClass = "bg-gray-300 dark:bg-gray-800"
  
  const bars = React.useMemo(() => {
    if (status === "critical") return 1
    if (status === "warning") return 2
    if (status === "good") return 3
    return 3
  }, [status])

  return (
    <div className="flex gap-0.5" role="progressbar" aria-valuenow={value * 100} aria-valuemin={0} aria-valuemax={100}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cx(
            "h-3.5 w-1 rounded-sm transition-colors duration-200",
            index < bars ? getColorClassName(color, "bg") : inactiveClass,
            showAnimation && "transform-gpu"
          )}
        />
      ))}
    </div>
  )
}

const metrics: Metric[] = [
  {
    label: "Lead-to-Quote Ratio",
    value: 0.61,
    percentage: "59.8%",
    fraction: "450/752",
    target: 0.65,
    trend: "up",
    description: "Percentage of leads that convert to quotes. Target: 65%"
  },
  {
    label: "Project Load",
    value: 0.24,
    percentage: "12.9%",
    fraction: "129/1K",
    target: 0.8,
    trend: "down",
    description: "Current project capacity utilization. Target: 80%"
  },
  {
    label: "Win Probability",
    value: 0.8,
    percentage: "85.1%",
    fraction: "280/329",
    target: 0.75,
    trend: "up",
    description: "Probability of winning active proposals. Target: 75%"
  },
]

function MetricCard({ metric }: { metric: Metric }) {
  const status = getMetricStatus(metric.value)
  const statusVariant = getStatusVariant(status)
  const progressVariant = getProgressVariant(status)
  
  const cardContent = (
    <div className="group">
      <dt className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-500">
          {metric.label}
        </span>
        {metric.trend && (
          <Badge 
            variant={statusVariant} 
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
          </Badge>
        )}
      </dt>
      <dd className="mt-1.5 space-y-2">
        <div className="flex items-center gap-2">
          <StatusIndicator value={metric.value} />
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {metric.percentage}{" "}
            <span className="font-medium text-gray-400 dark:text-gray-600">
              - {metric.fraction}
            </span>
          </p>
        </div>
        {metric.target && (
          <ProgressBar
            value={metric.value * 100}
            max={100}
            variant={progressVariant}
            size="sm"
            showAnimation
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            formatLabel={(value) => `${Math.round(value)}% of target`}
          />
        )}
      </dd>
    </div>
  )

  if (metric.description) {
    return (
      <Tooltip content={metric.description} variant="tremor" delayDuration={300}>
        <div className="cursor-help">
          {cardContent}
        </div>
      </Tooltip>
    )
  }

  return cardContent
}

export function MetricsCards() {
  return (
    <div role="region" aria-labelledby="metrics-heading">
      <h1 id="metrics-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        Overview
      </h1>
      <dl className="mt-6 flex flex-wrap items-start gap-x-12 gap-y-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </dl>
    </div>
  )
}
