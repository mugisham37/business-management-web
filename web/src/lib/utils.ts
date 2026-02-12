import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Alternative class name merger utility (alias for cn).
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param args - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cx(...args: ClassValue[]): string {
  return twMerge(clsx(...args));
}

// Tremor Raw focusInput [v0.0.1]
/**
 * Standard focus input styles for form elements.
 * Provides consistent focus ring and border styling.
 */
export const focusInput = [
  // base
  'focus:ring-2',
  // ring color
  'focus:ring-indigo-200 focus:dark:ring-indigo-700/30',
  // border color
  'focus:border-indigo-500 focus:dark:border-indigo-700',
];

// Tremor Raw focusRing [v0.0.1]
/**
 * Standard focus ring styles for interactive elements.
 * Provides outline-based focus indicators for accessibility.
 */
export const focusRing = [
  // base
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  // outline color
  'outline-indigo-500 dark:outline-indigo-500',
];

// Tremor Raw hasErrorInput [v0.0.1]
/**
 * Error state styles for form inputs.
 * Provides visual feedback for validation errors.
 */
export const hasErrorInput = [
  // base
  'ring-2',
  // border color
  'border-red-500 dark:border-red-700',
  // ring color
  'ring-red-200 dark:ring-red-700/30',
];

/**
 * Formats a number as a percentage with sign.
 * 
 * @param value - The number to format as percentage
 * @returns A formatted percentage string with + or - sign
 */
export function percentageFormatter(value: number): string {
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Collection of formatter utilities for data display
 */
export const formatters = {
  percentage: (value: number) => percentageFormatter(value),
  currency: (value: number, maxFractionDigits?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maxFractionDigits ?? 2,
    }).format(value);
  },
  number: (value: number) => value.toLocaleString(),
  unit: (value: number) => value.toLocaleString(),
  compact: (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },
};
