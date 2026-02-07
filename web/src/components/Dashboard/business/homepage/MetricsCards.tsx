"use client"

import React from "react"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Tooltip } from "@/components/ui/Tooltip"
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

const getStatusColor = (status: MetricStatus): string => {
  switch (status) {
    case "critical": return "var(--status-critical)"
    case "warning": return "var(--status-warning)"
    case "good": return "var(--status-good)"
    case "excellent": return "var(--status-excellent)"
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
  
  const bars = React.useMemo(() => {
    if (status === "critical") return 1
    if (status === "warning") return 2
    if (status === "good") return 3
    return 3
  }, [status])

  return (
    <div className="business-metrics-indicator" role="progressbar" aria-valuenow={value * 100} aria-valuemin={0} aria-valuemax={100}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cx(
            "business-metrics-indicator-bar",
            index >= bars && "business-metrics-indicator-bar-inactive",
            showAnimation && "transform-gpu"
          )}
          style={index < bars ? { backgroundColor: color } : undefined}
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
        <span className="text-business-label">
          {metric.label}
        </span>
        {metric.trend && (
          <Badge 
            variant={statusVariant} 
            size="sm"
            className="group-hover-visible"
          >
            {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
          </Badge>
        )}
      </dt>
      <dd style={{ marginTop: 'var(--spacing-xs)' }}>
        <div className="space-y-2">
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            <StatusIndicator value={metric.value} />
            <p className="text-business-value">
              {metric.percentage}{" "}
              <span style={{ 
                fontWeight: 'var(--font-medium)',
                color: 'var(--business-metrics-fraction)'
              }}>
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
              className="group-hover-visible"
              formatLabel={(value) => `${Math.round(value)}% of target`}
            />
          )}
        </div>
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
      <h1 
        id="metrics-heading" 
        style={{
          fontSize: 'var(--text-business-section-heading)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--foreground)'
        }}
      >
        Overview
      </h1>
      <dl 
        className="flex flex-wrap items-start"
        style={{
          marginTop: 'var(--spacing-business-section-gap)',
          gap: 'var(--spacing-business-section-gap)'
        }}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </dl>
    </div>
  )
}
