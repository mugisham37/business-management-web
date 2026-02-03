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