import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Tremor Raw cx [v0.0.1]
export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]
export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
]

// Tremor Raw focusRing [v0.0.1]
export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]

// Tremor Raw hasErrorInput [v0.0.1]
export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

// Comprehensive formatters object with all formatting utilities
export const formatters: { [key: string]: any } = {
  // Advanced currency formatter with customizable options
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD",
  }: {
    number: number
    maxFractionDigits?: number
    currency?: string
  }) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number),

  // Simple currency formatter (legacy support)
  currencySimple: (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),

  // Unit formatter
  unit: (number: number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number)
    return `${formattedNumber}`
  },

  // Simple unit formatter (legacy support)
  unitSimple: (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),

  // Advanced percentage formatter
  percentage: ({
    number,
    decimals = 1,
  }: {
    number: number
    decimals?: number
  }) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
    const symbol = number > 0 && number !== Infinity ? "+" : ""

    return `${symbol}${formattedNumber}`
  },

  // Million formatter
  million: ({
    number,
    decimals = 1,
  }: {
    number: number
    decimals?: number
  }) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
    return `${formattedNumber}M`
  },
}

// Standalone percentage formatter (legacy support)
export const percentageFormatter = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]
// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

interface CurrencyParams {
  number: number
  maxFractionDigits?: number
  currency?: string
}

interface PercentageParams {
  number: number
  decimals?: number
}

interface MillionParams {
  number: number
  decimals?: number
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string
  unit: (number: number) => string
  percentage: (params: PercentageParams) => string
  million: (params: MillionParams) => string
}

export const formatters: FormatterFunctions = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD",
  }: CurrencyParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number)
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number)
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)}M`
  },
}
