/**
 * Chart Utilities - Comprehensive Color and Chart Helper Functions
 * 
 * This module provides a complete set of utilities for chart styling and data manipulation,
 * including color management, gradient support, conditional coloring, and chart data helpers.
 * 
 * Features:
 * - Comprehensive color palette with dark mode support
 * - Gradient color utilities
 * - Conditional color mapping based on values
 * - Chart data manipulation helpers
 * - Type-safe color management
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export type ConditionalColorLevel = "low" | "medium" | "high" | "critical"

// ============================================================================
// CORE COLOR DEFINITIONS
// ============================================================================

export const chartColors = {
  // Primary Colors
  blue: {
    bg: "bg-blue-500 dark:bg-blue-500",
    stroke: "stroke-blue-500 dark:stroke-blue-500",
    fill: "fill-blue-500 dark:fill-blue-500",
    text: "text-blue-500 dark:text-blue-500",
  },
  lightBlue: {
    bg: "bg-blue-300/50 dark:bg-blue-800/50",
    stroke: "stroke-blue-300/50 dark:stroke-blue-800/50",
    fill: "fill-blue-300/50 dark:fill-blue-800/50",
    text: "text-blue-300/50 dark:text-blue-800/50",
  },
  emerald: {
    bg: "bg-emerald-500 dark:bg-emerald-400",
    stroke: "stroke-emerald-500 dark:stroke-emerald-400",
    fill: "fill-emerald-500 dark:fill-emerald-400",
    text: "text-emerald-500 dark:text-emerald-400",
  },
  lightEmerald: {
    bg: "bg-emerald-300/50 dark:bg-emerald-800/50",
    stroke: "stroke-emerald-300/50 dark:stroke-emerald-800/50",
    fill: "fill-emerald-300/50 dark:fill-emerald-800/50",
    text: "text-emerald-300/50 dark:text-emerald-800/50",
  },
  violet: {
    bg: "bg-violet-500 dark:bg-violet-500",
    stroke: "stroke-violet-500 dark:stroke-violet-500",
    fill: "fill-violet-500 dark:fill-violet-500",
    text: "text-violet-500 dark:text-violet-500",
  },
  indigo: {
    bg: "bg-indigo-600 dark:bg-indigo-500",
    stroke: "stroke-indigo-600 dark:stroke-indigo-500",
    fill: "fill-indigo-600 dark:fill-indigo-500",
    text: "text-indigo-600 dark:text-indigo-500",
  },
  
  // Warm Colors
  amber: {
    bg: "bg-amber-500 dark:bg-amber-500",
    stroke: "stroke-amber-500 dark:stroke-amber-500",
    fill: "fill-amber-500 dark:fill-amber-500",
    text: "text-amber-500 dark:text-amber-500",
  },
  orange: {
    bg: "bg-orange-500 dark:bg-orange-400",
    stroke: "stroke-orange-500 dark:stroke-orange-400",
    fill: "fill-orange-500 dark:fill-orange-400",
    text: "text-orange-500 dark:text-orange-400",
  },
  red: {
    bg: "bg-red-500 dark:bg-red-500",
    stroke: "stroke-red-500 dark:stroke-red-500",
    fill: "fill-red-500 dark:fill-red-500",
    text: "text-red-500 dark:text-red-500",
  },
  rose: {
    bg: "bg-rose-600 dark:bg-rose-500",
    stroke: "stroke-rose-600 dark:stroke-rose-500",
    fill: "fill-rose-600 dark:fill-rose-500",
    text: "text-rose-600 dark:text-rose-500",
  },
  pink: {
    bg: "bg-pink-500 dark:bg-pink-500",
    stroke: "stroke-pink-500 dark:stroke-pink-500",
    fill: "fill-pink-500 dark:fill-pink-500",
    text: "text-pink-500 dark:text-pink-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-500 dark:bg-fuchsia-500",
    stroke: "stroke-fuchsia-500 dark:stroke-fuchsia-500",
    fill: "fill-fuchsia-500 dark:fill-fuchsia-500",
    text: "text-fuchsia-500 dark:text-fuchsia-500",
  },
  
  // Cool Colors
  sky: {
    bg: "bg-sky-500 dark:bg-sky-500",
    stroke: "stroke-sky-500 dark:stroke-sky-500",
    fill: "fill-sky-500 dark:fill-sky-500",
    text: "text-sky-500 dark:text-sky-500",
  },
  cyan: {
    bg: "bg-cyan-500 dark:bg-cyan-500",
    stroke: "stroke-cyan-500 dark:stroke-cyan-500",
    fill: "fill-cyan-500 dark:fill-cyan-500",
    text: "text-cyan-500 dark:text-cyan-500",
  },
  lime: {
    bg: "bg-lime-500 dark:bg-lime-500",
    stroke: "stroke-lime-500 dark:stroke-lime-500",
    fill: "fill-lime-500 dark:fill-lime-500",
    text: "text-lime-500 dark:text-lime-500",
  },
  
  // Neutral Colors
  gray: {
    bg: "bg-gray-400 dark:bg-gray-600",
    stroke: "stroke-gray-400 dark:stroke-gray-600",
    fill: "fill-gray-400 dark:fill-gray-600",
    text: "text-gray-400 dark:text-gray-600",
  },
  lightGray: {
    bg: "bg-gray-300 dark:bg-gray-700",
    stroke: "stroke-gray-300 dark:stroke-gray-700",
    fill: "fill-gray-300 dark:fill-gray-700",
    text: "text-gray-300 dark:text-gray-700",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

// ============================================================================
// GRADIENT COLOR DEFINITIONS
// ============================================================================

export const chartGradientColors = {
  blue: "from-blue-200 to-blue-500 dark:from-blue-200/10 dark:to-blue-400",
  lightBlue: "from-blue-200 to-blue-500 dark:from-blue-200/10 dark:to-blue-400",
  emerald: "from-emerald-200 to-emerald-500 dark:from-emerald-200/10 dark:to-emerald-400",
  lightEmerald: "from-emerald-200 to-emerald-500 dark:from-emerald-200/10 dark:to-emerald-400",
  violet: "from-violet-200 to-violet-500 dark:from-violet-200/10 dark:to-violet-400",
  indigo: "from-indigo-200 to-indigo-500 dark:from-indigo-200/10 dark:to-indigo-400",
  amber: "from-amber-200 to-amber-500 dark:from-amber-200/10 dark:to-amber-400",
  orange: "from-orange-200 to-orange-500 dark:from-orange-200/10 dark:to-orange-400",
  red: "from-red-200 to-red-500 dark:from-red-200/10 dark:to-red-400",
  rose: "from-rose-200 to-rose-500 dark:from-rose-200/10 dark:to-rose-400",
  pink: "from-pink-200 to-pink-500 dark:from-pink-200/10 dark:to-pink-400",
  fuchsia: "from-fuchsia-200 to-fuchsia-500 dark:from-fuchsia-200/10 dark:to-fuchsia-400",
  sky: "from-sky-200 to-sky-500 dark:from-sky-200/10 dark:to-sky-400",
  cyan: "from-cyan-200 to-cyan-500 dark:from-cyan-200/10 dark:to-cyan-400",
  lime: "from-lime-200 to-lime-500 dark:from-lime-200/10 dark:to-lime-400",
  gray: "from-gray-200 to-gray-500 dark:from-gray-200/10 dark:to-gray-400",
  lightGray: "from-gray-200 to-gray-500 dark:from-gray-200/10 dark:to-gray-400",
} as const satisfies Record<string, string>

// ============================================================================
// CONDITIONAL COLOR DEFINITIONS
// ============================================================================

export const chartConditionalColors = {
  blue: {
    low: "fill-blue-200 dark:fill-blue-300",
    medium: "fill-blue-300 dark:fill-blue-400",
    high: "fill-blue-400 dark:fill-blue-500",
    critical: "fill-blue-500 dark:fill-blue-600",
  },
  lightBlue: {
    low: "fill-blue-200 dark:fill-blue-300",
    medium: "fill-blue-300 dark:fill-blue-400",
    high: "fill-blue-400 dark:fill-blue-500",
    critical: "fill-blue-500 dark:fill-blue-600",
  },
  emerald: {
    low: "fill-emerald-200 dark:fill-emerald-300",
    medium: "fill-emerald-300 dark:fill-emerald-400",
    high: "fill-emerald-400 dark:fill-emerald-500",
    critical: "fill-emerald-500 dark:fill-emerald-600",
  },
  lightEmerald: {
    low: "fill-emerald-200 dark:fill-emerald-300",
    medium: "fill-emerald-300 dark:fill-emerald-400",
    high: "fill-emerald-400 dark:fill-emerald-500",
    critical: "fill-emerald-500 dark:fill-emerald-600",
  },
  violet: {
    low: "fill-violet-200 dark:fill-violet-300",
    medium: "fill-violet-300 dark:fill-violet-400",
    high: "fill-violet-400 dark:fill-violet-500",
    critical: "fill-violet-500 dark:fill-violet-600",
  },
  indigo: {
    low: "fill-indigo-200 dark:fill-indigo-300",
    medium: "fill-indigo-300 dark:fill-indigo-400",
    high: "fill-indigo-400 dark:fill-indigo-500",
    critical: "fill-indigo-500 dark:fill-indigo-600",
  },
  amber: {
    low: "fill-amber-200 dark:fill-amber-300",
    medium: "fill-amber-300 dark:fill-amber-400",
    high: "fill-amber-400 dark:fill-amber-500",
    critical: "fill-amber-500 dark:fill-amber-600",
  },
  orange: {
    low: "fill-orange-200 dark:fill-orange-300",
    medium: "fill-orange-300 dark:fill-orange-400",
    high: "fill-orange-400 dark:fill-orange-500",
    critical: "fill-orange-500 dark:fill-orange-600",
  },
  red: {
    low: "fill-red-200 dark:fill-red-300",
    medium: "fill-red-300 dark:fill-red-400",
    high: "fill-red-400 dark:fill-red-500",
    critical: "fill-red-500 dark:fill-red-600",
  },
  rose: {
    low: "fill-rose-200 dark:fill-rose-300",
    medium: "fill-rose-300 dark:fill-rose-400",
    high: "fill-rose-400 dark:fill-rose-500",
    critical: "fill-rose-500 dark:fill-rose-600",
  },
  pink: {
    low: "fill-pink-200 dark:fill-pink-300",
    medium: "fill-pink-300 dark:fill-pink-400",
    high: "fill-pink-400 dark:fill-pink-500",
    critical: "fill-pink-500 dark:fill-pink-600",
  },
  fuchsia: {
    low: "fill-fuchsia-200 dark:fill-fuchsia-300",
    medium: "fill-fuchsia-300 dark:fill-fuchsia-400",
    high: "fill-fuchsia-400 dark:fill-fuchsia-500",
    critical: "fill-fuchsia-500 dark:fill-fuchsia-600",
  },
  sky: {
    low: "fill-sky-200 dark:fill-sky-300",
    medium: "fill-sky-300 dark:fill-sky-400",
    high: "fill-sky-400 dark:fill-sky-500",
    critical: "fill-sky-500 dark:fill-sky-600",
  },
  cyan: {
    low: "fill-cyan-200 dark:fill-cyan-300",
    medium: "fill-cyan-300 dark:fill-cyan-400",
    high: "fill-cyan-400 dark:fill-cyan-500",
    critical: "fill-cyan-500 dark:fill-cyan-600",
  },
  lime: {
    low: "fill-lime-200 dark:fill-lime-300",
    medium: "fill-lime-300 dark:fill-lime-400",
    high: "fill-lime-400 dark:fill-lime-500",
    critical: "fill-lime-500 dark:fill-lime-600",
  },
  gray: {
    low: "fill-gray-200 dark:fill-gray-300",
    medium: "fill-gray-300 dark:fill-gray-400",
    high: "fill-gray-400 dark:fill-gray-500",
    critical: "fill-gray-500 dark:fill-gray-600",
  },
  lightGray: {
    low: "fill-gray-200 dark:fill-gray-300",
    medium: "fill-gray-300 dark:fill-gray-400",
    high: "fill-gray-400 dark:fill-gray-500",
    critical: "fill-gray-500 dark:fill-gray-600",
  },
} as const satisfies Record<string, Record<ConditionalColorLevel, string>>

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AvailableChartColorsKeys = keyof typeof chartColors
export type AvailableChartGradientColorsKeys = keyof typeof chartGradientColors
export type AvailableChartConditionalColorsKeys = keyof typeof chartConditionalColors

// ============================================================================
// COLOR ARRAYS AND CONSTANTS
// ============================================================================

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>

export const AvailableChartGradientColors: AvailableChartGradientColorsKeys[] = Object.keys(
  chartGradientColors,
) as Array<AvailableChartGradientColorsKeys>

export const AvailableChartConditionalColors: AvailableChartConditionalColorsKeys[] = Object.keys(
  chartConditionalColors,
) as Array<AvailableChartConditionalColorsKeys>

// ============================================================================
// FALLBACK COLOR DEFINITIONS
// ============================================================================

const fallbackColor = {
  bg: "bg-gray-500 dark:bg-gray-500",
  stroke: "stroke-gray-500 dark:stroke-gray-500",
  fill: "fill-gray-500 dark:fill-gray-500",
  text: "text-gray-500 dark:text-gray-500",
} as const

const fallbackGradientColor = "from-gray-200 to-gray-500 dark:from-gray-200/10 dark:to-gray-400" as const

const fallbackConditionalColors = {
  low: "fill-gray-300 dark:fill-gray-400",
  medium: "fill-gray-400 dark:fill-gray-500",
  high: "fill-gray-500 dark:fill-gray-600",
  critical: "fill-gray-600 dark:fill-gray-700",
} as const

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the CSS class name for a specific color and utility type
 * @param color - The color key from available chart colors
 * @param type - The utility type (bg, stroke, fill, text)
 * @returns CSS class string with dark mode support
 */
export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

/**
 * Get the gradient CSS class name for a specific color
 * @param color - The color key from available gradient colors
 * @returns Gradient CSS class string with dark mode support
 */
export const getGradientColorClassName = (
  color: AvailableChartGradientColorsKeys,
): string => {
  return chartGradientColors[color] ?? fallbackGradientColor
}

/**
 * Get conditional color class based on value and color scheme
 * @param value - Numeric value between 0 and 1 to determine intensity
 * @param color - The color key from available conditional colors
 * @returns CSS class string for conditional coloring
 */
export const getConditionalColorClassName = (
  value: number,
  color: AvailableChartConditionalColorsKeys,
): string => {
  const classes = chartConditionalColors[color] ?? fallbackConditionalColors

  if (value <= 0.25) return classes.low
  if (value <= 0.5) return classes.medium
  if (value <= 0.75) return classes.high
  return classes.critical
}

/**
 * Construct a map of categories to colors for consistent chart coloring
 * @param categories - Array of category names
 * @param colors - Array of color keys to cycle through
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
 * Get a random color from the available chart colors
 * @returns Random color key
 */
export const getRandomChartColor = (): AvailableChartColorsKeys => {
  const randomIndex = Math.floor(Math.random() * AvailableChartColors.length)
  return AvailableChartColors[randomIndex]
}

/**
 * Get a subset of colors excluding specified colors
 * @param excludeColors - Array of color keys to exclude
 * @returns Array of available color keys excluding the specified ones
 */
export const getAvailableColorsExcluding = (
  excludeColors: AvailableChartColorsKeys[] = [],
): AvailableChartColorsKeys[] => {
  return AvailableChartColors.filter(color => !excludeColors.includes(color))
}

// ============================================================================
// CHART DATA UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Y-axis domain for charts
 * @param autoMinValue - Whether to automatically calculate minimum value
 * @param minValue - Optional minimum value override
 * @param maxValue - Optional maximum value override
 * @returns Array containing min and max domain values
 */
export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
): [string | number, string | number] => {
  const minDomain = autoMinValue ? "auto" : (minValue ?? 0)
  const maxDomain = maxValue ?? "auto"
  return [minDomain, maxDomain]
}

/**
 * Check if an array of objects has only one unique value for a specific key
 * @param array - Array of objects to check
 * @param keyToCheck - The key to check for unique values
 * @returns Boolean indicating if only one unique value exists
 */
export function hasOnlyOneValueForKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: any[],
  keyToCheck: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueValues: any[] = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      const value = obj[keyToCheck]
      if (!uniqueValues.includes(value)) {
        uniqueValues.push(value)
        if (uniqueValues.length > 1) {
          return false
        }
      }
    }
  }

  return uniqueValues.length <= 1
}

/**
 * Get the most contrasting color for text based on background color
 * @param backgroundColor - The background color key
 * @returns Color key that provides good contrast
 */
export const getContrastingTextColor = (
  backgroundColor: AvailableChartColorsKeys,
): AvailableChartColorsKeys => {
  // Light colors that need dark text
  const lightColors: AvailableChartColorsKeys[] = ['lightBlue', 'lightEmerald', 'lightGray']
  
  if (lightColors.includes(backgroundColor)) {
    return 'gray'
  }
  
  // For most colors, use a lighter variant or white-ish color
  return 'lightGray'
}

/**
 * Generate a color palette for a specific number of items
 * @param count - Number of colors needed
 * @param preferredColors - Optional array of preferred colors to use first
 * @returns Array of color keys
 */
export const generateColorPalette = (
  count: number,
  preferredColors: AvailableChartColorsKeys[] = [],
): AvailableChartColorsKeys[] => {
  const palette: AvailableChartColorsKeys[] = []
  const availableColors = [...preferredColors, ...AvailableChartColors]
  
  for (let i = 0; i < count; i++) {
    palette.push(availableColors[i % availableColors.length])
  }
  
  return palette
}

// ============================================================================
// CHART CONFIGURATION HELPERS
// ============================================================================

/**
 * Default color configuration for different chart types
 */
export const chartDefaults = {
  colors: {
    primary: ['blue', 'emerald', 'violet', 'amber', 'rose'] as AvailableChartColorsKeys[],
    secondary: ['lightBlue', 'lightEmerald', 'gray', 'lightGray'] as AvailableChartColorsKeys[],
    status: {
      success: 'emerald' as AvailableChartColorsKeys,
      warning: 'amber' as AvailableChartColorsKeys,
      error: 'red' as AvailableChartColorsKeys,
      info: 'blue' as AvailableChartColorsKeys,
    },
  },
  gradients: {
    primary: ['blue', 'emerald', 'violet'] as AvailableChartGradientColorsKeys[],
    warm: ['amber', 'orange', 'red'] as AvailableChartGradientColorsKeys[],
    cool: ['sky', 'cyan', 'blue'] as AvailableChartGradientColorsKeys[],
  },
} as const

/**
 * Get default colors for a specific chart type
 * @param chartType - Type of chart (primary, secondary, status)
 * @returns Array of appropriate color keys
 */
export const getDefaultChartColors = (
  chartType: keyof typeof chartDefaults.colors = 'primary'
): AvailableChartColorsKeys[] => {
  if (chartType === 'status') {
    return Object.values(chartDefaults.colors.status)
  }
  return chartDefaults.colors[chartType]
}