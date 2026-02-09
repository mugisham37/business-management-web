// Formatting Utilities for Frontend-Backend Foundation Layer
// Provides utilities for formatting dates, times, and names

/**
 * Formats a date to a locale-appropriate string (e.g., "Jan 15, 2024")
 * 
 * @param date - Date object or ISO string to format
 * @returns Formatted date string
 * 
 * Requirements: 18.1
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Formats a date and time to a locale-appropriate string (e.g., "Jan 15, 2024, 02:30 PM")
 * 
 * @param date - Date object or ISO string to format
 * @returns Formatted date and time string
 * 
 * Requirements: 18.1
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formats a full name from first and last name components
 * Concatenates with a space and trims any extra whitespace
 * 
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Full name string
 * 
 * Requirements: 18.2
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "just now")
 * For dates older than 7 days, returns formatted date instead
 * 
 * @param date - Date object or ISO string to format
 * @returns Relative time string or formatted date
 * 
 * Requirements: 18.1
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}
