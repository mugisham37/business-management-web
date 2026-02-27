import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge
 * Handles conditional classes and resolves Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Alias for cn() - merges class names using clsx and tailwind-merge
 * @deprecated Use cn() instead for consistency
 */
export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-ring/20",
  // border color
  "focus:border-ring",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-ring",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-destructive",
  // ring color
  "ring-destructive/20",
]

// Number formatters

/**
 * Formats a number with US locale formatting
 * @param number - The number to format
 * @param decimals - Number of decimal places (default: 0)
 */
export const usNumberformatter = (number: number, decimals = 0) =>
  Intl.NumberFormat("us", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(number))
    .toString()

/**
 * Formats a number as a percentage with optional + prefix for positive values
 * @param number - The number to format (0.5 = 50%)
 * @param decimals - Number of decimal places (default: 1)
 */
export const percentageFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  const symbol = number > 0 && number !== Infinity ? "+" : ""

  return `${symbol}${formattedNumber}`
}

/**
 * Formats a number in millions with M suffix
 * @param number - The number to format
 * @param decimals - Number of decimal places (default: 1)
 */
export const millionFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  return `${formattedNumber}M`
}

/**
 * Collection of number formatters for different use cases
 */
export const formatters: { [key: string]: any } = {
  currency: (number: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(number),
  unit: (number: number) => `${usNumberformatter(number)}`,
}
