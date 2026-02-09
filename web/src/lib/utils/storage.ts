// Storage and Utility Functions for Frontend-Backend Foundation Layer
// Provides utilities for safe property access and debouncing

/**
 * Safely accesses nested properties in an object using a dot-notation path
 * Returns a default value if any part of the path is undefined or null
 * 
 * @param obj - The object to access properties from
 * @param path - Dot-notation path to the property (e.g., "user.profile.name")
 * @param defaultValue - Default value to return if property doesn't exist
 * @returns The value at the path or the default value
 * 
 * Requirements: 18.5
 */
export function safeGetNestedProperty<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result as T;
}

/**
 * Creates a debounced version of a function that delays execution
 * until after a specified wait time has elapsed since the last call
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced version of the function
 * 
 * Requirements: 18.6
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
