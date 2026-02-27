export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export const chartColors = {
  chart1: {
    bg: "bg-chart-1",
    stroke: "stroke-chart-1",
    fill: "fill-chart-1",
    text: "text-chart-1",
  },
  chart2: {
    bg: "bg-chart-2",
    stroke: "stroke-chart-2",
    fill: "fill-chart-2",
    text: "text-chart-2",
  },
  chart3: {
    bg: "bg-chart-3",
    stroke: "stroke-chart-3",
    fill: "fill-chart-3",
    text: "text-chart-3",
  },
  chart4: {
    bg: "bg-chart-4",
    stroke: "stroke-chart-4",
    fill: "fill-chart-4",
    text: "text-chart-4",
  },
  chart5: {
    bg: "bg-chart-5",
    stroke: "stroke-chart-5",
    fill: "fill-chart-5",
    text: "text-chart-5",
  },
  primary: {
    bg: "bg-primary",
    stroke: "stroke-primary",
    fill: "fill-primary",
    text: "text-primary",
  },
  secondary: {
    bg: "bg-secondary",
    stroke: "stroke-secondary",
    fill: "fill-secondary",
    text: "text-secondary",
  },
  accent: {
    bg: "bg-accent",
    stroke: "stroke-accent",
    fill: "fill-accent",
    text: "text-accent",
  },
  muted: {
    bg: "bg-muted",
    stroke: "stroke-muted",
    fill: "fill-muted",
    text: "text-muted",
  },
  destructive: {
    bg: "bg-destructive",
    stroke: "stroke-destructive",
    fill: "fill-destructive",
    text: "text-destructive",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

export type AvailableChartColorsKeys = keyof typeof chartColors

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>

/**
 * Constructs a map of category names to chart colors
 * Colors are assigned cyclically if there are more categories than colors
 * 
 * @param categories - Array of category names
 * @param colors - Array of color keys to use
 * @returns Map of category names to color keys
 */
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

/**
 * Gets the Tailwind class name for a specific color and utility type
 * Falls back to muted color if the requested color doesn't exist
 * 
 * @param color - The chart color key
 * @param type - The utility type (bg, stroke, fill, or text)
 * @returns Tailwind class name string
 */
export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  const fallbackColor = {
    bg: "bg-muted",
    stroke: "stroke-muted",
    fill: "fill-muted",
    text: "text-muted",
  }
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

// Tremor Raw getYAxisDomain [v0.0.0]

/**
 * Calculates the Y-axis domain for charts
 * 
 * @param autoMinValue - Whether to automatically calculate minimum value
 * @param minValue - Optional minimum value override
 * @param maxValue - Optional maximum value override
 * @returns Tuple of [minDomain, maxDomain]
 */
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

/**
 * Checks if an array of objects has only one unique value for a specific key
 * Useful for determining if a data series has only a single data point
 * 
 * @param array - Array of objects to check
 * @param keyToCheck - The key to check for uniqueness
 * @returns True if only one unique value exists for the key
 */
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
