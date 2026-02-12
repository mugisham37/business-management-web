type Metric = {
  label: string
  value: number
  percentage: string
  fraction: string
}

const getBarsCount = (value: number): number => {
  if (value < 0.3) return 1
  if (value < 0.7) return 2
  return 3
}

const getBarClass = (index: number, activeBars: number): string => {
  if (index >= activeBars) return "bg-muted"
  
  if (activeBars === 1) return "bg-destructive"
  if (activeBars === 2) return "bg-accent"
  return "bg-secondary"
}

function Indicator({ number }: { number: number }) {
  const activeBars = getBarsCount(number)

  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-3.5 w-1 rounded-sm ${getBarClass(index, activeBars)}`}
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
  },
  {
    label: "Project Load",
    value: 0.24,
    percentage: "12.9%",
    fraction: "129/1K",
  },
  {
    label: "Win Probability",
    value: 0.8,
    percentage: "85.1%",
    fraction: "280/329",
  },
]

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">
        {metric.label}
      </dt>
      <dd className="mt-1.5 flex items-center gap-2">
        <Indicator number={metric.value} />
        <p className="text-lg font-semibold text-foreground">
          {metric.percentage}{" "}
          <span className="font-medium text-muted-foreground">
            - {metric.fraction}
          </span>
        </p>
      </dd>
    </div>
  )
}

export function MetricsCards() {
  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">
        Overview
      </h1>
      <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </dl>
    </>
  )
}
