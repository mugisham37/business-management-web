import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Tremor Raw cx utility function [v0.0.1]
 * Combines clsx and tailwind-merge for optimal class name handling
 * @param args - Class values to merge
 * @returns Merged and deduplicated class string
 */
export function cx(...args: ClassValue[]): string {
  return twMerge(clsx(...args))
}

/**
 * shadcn/ui cn utility function
 * Alias for cx function to maintain compatibility
 * @param args - Class values to merge
 * @returns Merged and deduplicated class string
 */
export function cn(...args: ClassValue[]): string {
  return twMerge(clsx(...args))
}

// =============================================================================
// STYLING CONSTANTS
// =============================================================================

/**
 * Tremor Raw focusInput styles [v0.0.1]
 * Standard focus styles for input elements
 */
export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
] as const

/**
 * Tremor Raw focusRing styles [v0.0.1]
 * Standard focus ring styles for interactive elements
 */
export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
] as const

/**
 * Tremor Raw hasErrorInput styles [v0.0.1]
 * Error state styles for input elements
 */
export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
] as const

// =============================================================================
// FORMATTER INTERFACES
// =============================================================================

export interface CurrencyFormatterParams {
  number: number
  maxFractionDigits?: number
  minFractionDigits?: number
  currency?: string
  locale?: string
}

export interface PercentageFormatterParams {
  number: number
  decimals?: number
  showSign?: boolean
  locale?: string
}

export interface UnitFormatterParams {
  number: number
  maxFractionDigits?: number
  minFractionDigits?: number
  locale?: string
}

export interface MillionFormatterParams {
  number: number
  decimals?: number
  locale?: string
  suffix?: string
}

export interface NumberFormatterParams {
  number: number
  maxFractionDigits?: number
  minFractionDigits?: number
  locale?: string
  notation?: "standard" | "scientific" | "engineering" | "compact"
}

// =============================================================================
// FORMATTER FUNCTIONS
// =============================================================================

/**
 * Comprehensive formatters object with all formatting utilities
 * Provides both advanced and legacy formatting options
 */
export const formatters = {
  /**
   * Advanced currency formatter with full customization
   * @param params - Currency formatting parameters
   * @returns Formatted currency string
   */
  currency: ({
    number,
    maxFractionDigits = 2,
    minFractionDigits = 0,
    currency = "USD",
    locale = "en-US",
  }: CurrencyFormatterParams): string => {
    if (!Number.isFinite(number)) {
      return currency === "USD" ? "$0.00" : "0.00"
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: maxFractionDigits,
        minimumFractionDigits: minFractionDigits,
      }).format(number)
    } catch (error) {
      console.warn("Currency formatting error:", error)
      return `${currency} ${number.toFixed(maxFractionDigits)}`
    }
  },

  /**
   * Simple currency formatter (legacy support)
   * @param value - Number to format
   * @returns Formatted currency string without decimals
   */
  currencySimple: (value: number): string => {
    if (!Number.isFinite(value)) return "$0"
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    } catch (error) {
      console.warn("Simple currency formatting error:", error)
      return `$${Math.round(value)}`
    }
  },

  /**
   * Advanced unit/number formatter
   * @param params - Unit formatting parameters
   * @returns Formatted number string
   */
  unit: ({
    number,
    maxFractionDigits = 2,
    minFractionDigits = 0,
    locale = "en-US",
  }: UnitFormatterParams): string => {
    if (!Number.isFinite(number)) return "0"

    try {
      return new Intl.NumberFormat(locale, {
        style: "decimal",
        maximumFractionDigits: maxFractionDigits,
        minimumFractionDigits: minFractionDigits,
      }).format(number)
    } catch (error) {
      console.warn("Unit formatting error:", error)
      return number.toFixed(maxFractionDigits)
    }
  },

  /**
   * Simple unit formatter (legacy support)
   * @param value - Number to format
   * @returns Formatted number string without decimals
   */
  unitSimple: (value: number): string => {
    if (!Number.isFinite(value)) return "0"

    try {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    } catch (error) {
      console.warn("Simple unit formatting error:", error)
      return Math.round(value).toString()
    }
  },

  /**
   * Advanced percentage formatter with sign control
   * @param params - Percentage formatting parameters
   * @returns Formatted percentage string
   */
  percentage: ({
    number,
    decimals = 1,
    showSign = true,
    locale = "en-US",
  }: PercentageFormatterParams): string => {
    if (!Number.isFinite(number)) return "0%"

    try {
      const formattedNumber = new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number)

      if (showSign && number > 0 && number !== Infinity) {
        return `+${formattedNumber}`
      }

      return formattedNumber
    } catch (error) {
      console.warn("Percentage formatting error:", error)
      const percentage = (number * 100).toFixed(decimals)
      const sign = showSign && number > 0 ? "+" : ""
      return `${sign}${percentage}%`
    }
  },

  /**
   * Million formatter for large numbers
   * @param params - Million formatting parameters
   * @returns Formatted number with million suffix
   */
  million: ({
    number,
    decimals = 1,
    locale = "en-US",
    suffix = "M",
  }: MillionFormatterParams): string => {
    if (!Number.isFinite(number)) return `0${suffix}`

    try {
      const formattedNumber = new Intl.NumberFormat(locale, {
        style: "decimal",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number)
      return `${formattedNumber}${suffix}`
    } catch (error) {
      console.warn("Million formatting error:", error)
      return `${number.toFixed(decimals)}${suffix}`
    }
  },

  /**
   * General number formatter with notation support
   * @param params - Number formatting parameters
   * @returns Formatted number string
   */
  number: ({
    number,
    maxFractionDigits = 2,
    minFractionDigits = 0,
    locale = "en-US",
    notation = "standard",
  }: NumberFormatterParams): string => {
    if (!Number.isFinite(number)) return "0"

    try {
      return new Intl.NumberFormat(locale, {
        style: "decimal",
        notation,
        maximumFractionDigits: maxFractionDigits,
        minimumFractionDigits: minFractionDigits,
      }).format(number)
    } catch (error) {
      console.warn("Number formatting error:", error)
      return number.toFixed(maxFractionDigits)
    }
  },
} as const

// =============================================================================
// LEGACY FORMATTERS (Backward Compatibility)
// =============================================================================

/**
 * Standalone percentage formatter (legacy support)
 * @param value - Number to format as percentage
 * @returns Formatted percentage string with sign
 */
export const percentageFormatter = (value: number): string => {
  if (!Number.isFinite(value)) return "0.0%"
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================

/**
 * Validates if a number is safe for formatting
 * @param value - Value to validate
 * @returns Boolean indicating if the value is safe
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value)
}

/**
 * Safely formats any numeric value with fallback
 * @param value - Value to format
 * @param formatter - Formatter function to use
 * @param fallback - Fallback value if formatting fails
 * @param args - Additional arguments for the formatter
 * @returns Formatted string or fallback
 */
export const safeFormat = <T extends any[], R>(
  value: unknown,
  formatter: (value: number, ...args: T) => R,
  fallback: R,
  ...args: T
): R => {
  try {
    if (!isValidNumber(value)) return fallback
    return formatter(value, ...args)
  } catch (error) {
    console.warn("Safe format error:", error)
    return fallback
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type FormatterFunction = typeof formatters[keyof typeof formatters]
export type StyleConstant = typeof focusInput | typeof focusRing | typeof hasErrorInput
