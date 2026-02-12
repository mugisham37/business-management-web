// Tremor Raw chartColors [v0.0.0]

export type ColorUtility = "bg" | "stroke" | "fill" | "text"

// Theme-connected chart colors using CSS variables from global.css
export const chartColors = {
  "chart-1": {
    bg: "bg-chart-1",
    stroke: "stroke-chart-1",
    fill: "fill-chart-1",
    text: "text-chart-1",
  },
  "chart-2": {
    bg: "bg-chart-2",
    stroke: "stroke-chart-2",
    fill: "fill-chart-2",
    text: "text-chart-2",
  },
  "chart-3": {
    bg: "bg-chart-3",
    stroke: "stroke-chart-3",
    fill: "fill-chart-3",
    text: "text-chart-3",
  },
  "chart-4": {
    bg: "bg-chart-4",
    stroke: "stroke-chart-4",
    fill: "fill-chart-4",
    text: "text-chart-4",
  },
  "chart-5": {
    bg: "bg-chart-5",
    stroke: "stroke-chart-5",
    fill: "fill-chart-5",
    text: "text-chart-5",
  },
  // Legacy color names mapped to theme colors for backward compatibility
  blue: {
    bg: "bg-chart-1",
    stroke: "stroke-chart-1",
    fill: "fill-chart-1",
    text: "text-chart-1",
  },
  emerald: {
    bg: "bg-chart-2",
    stroke: "stroke-chart-2",
    fill: "fill-chart-2",
    text: "text-chart-2",
  },
  violet: {
    bg: "bg-chart-3",
    stroke: "stroke-chart-3",
    fill: "fill-chart-3",
    text: "text-chart-3",
  },
  amber: {
    bg: "bg-chart-4",
    stroke: "stroke-chart-4",
    fill: "fill-chart-4",
    text: "text-chart-4",
  },
  cyan: {
    bg: "bg-chart-5",
    stroke: "stroke-chart-5",
    fill: "fill-chart-5",
    text: "text-chart-5",
  },
  gray: {
    bg: "bg-muted",
    stroke: "stroke-muted",
    fill: "fill-muted",
    text: "text-muted-foreground",
  },
  indigo: {
    bg: "bg-primary",
    stroke: "stroke-primary",
    fill: "fill-primary",
    text: "text-primary",
  },
  pink: {
    bg: "bg-accent",
    stroke: "stroke-accent",
    fill: "fill-accent",
    text: "text-accent",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

export type AvailableChartColorsKeys = keyof typeof chartColors

// Default to theme chart colors (chart-1 through chart-5)
export const AvailableChartColors: AvailableChartColorsKeys[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
]

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>()
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length])
  })
  return categoryColors
}

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  const fallbackColor = {
    bg: "bg-muted",
    stroke: "stroke-muted",
    fill: "fill-muted",
    text: "text-muted-foreground",
  }
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

export const getConditionalColorClassName = (
  value: number,
  color: AvailableChartColorsKeys,
): string => {
  // Returns color class based on value intensity
  // For conditional coloring based on data values
  const baseColor = chartColors[color]
  if (!baseColor) return "fill-muted"
  
  // Use fill color for bar charts
  return baseColor.fill
}

export const getGradientColorClassName = (
  color: AvailableChartColorsKeys,
): string => {
  // Returns gradient color classes for the specified color
  // Using theme colors for gradients
  const colorMap: Partial<Record<AvailableChartColorsKeys, string>> = {
    "chart-1": "from-chart-1/80 to-chart-1",
    "chart-2": "from-chart-2/80 to-chart-2",
    "chart-3": "from-chart-3/80 to-chart-3",
    "chart-4": "from-chart-4/80 to-chart-4",
    "chart-5": "from-chart-5/80 to-chart-5",
    blue: "from-chart-1/80 to-chart-1",
    emerald: "from-chart-2/80 to-chart-2",
    violet: "from-chart-3/80 to-chart-3",
    amber: "from-chart-4/80 to-chart-4",
    cyan: "from-chart-5/80 to-chart-5",
    gray: "from-muted/80 to-muted",
    indigo: "from-primary/80 to-primary",
    pink: "from-accent/80 to-accent",
  }
  
  return colorMap[color] ?? "from-muted/80 to-muted"
}

// Tremor Raw getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
) => {
  const minDomain = autoMinValue ? "auto" : (minValue ?? 0)
  const maxDomain = maxValue ?? "auto"
  return [minDomain, maxDomain]
}

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  array: any[],
  keyToCheck: string,
): boolean {
  const val: any[] = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck])
      if (val.length > 1) {
        return false
      }
    }
  }

  return true
}
