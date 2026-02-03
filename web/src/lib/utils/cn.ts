import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with conflict resolution
 * 
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 * 
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-2 overridden)
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Alias for cn - used by Tremor Raw components
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 */
export function cx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Focus ring styles for interactive elements
 * Provides consistent focus styles across the application
 */
export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-indigo-500 dark:outline-indigo-500",
];

/**
 * Focus styles for input elements
 * Provides consistent focus styling for form inputs
 */
export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-indigo-200 focus:dark:ring-indigo-700/30",
  // border color
  "focus:border-indigo-500 focus:dark:border-indigo-700",
];

/**
 * Error styles for input elements
 * Applied when input has validation errors
 */
export const hasErrorInput = [
  // base
  "ring-2",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
  // border color
  "border-red-500 dark:border-red-700",
];