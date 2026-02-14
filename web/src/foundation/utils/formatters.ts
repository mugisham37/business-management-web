/**
 * Data Formatters
 * 
 * Provides utility functions for formatting data for display including:
 * - Date and datetime formatting
 * - User name formatting
 * - Audit log action formatting
 * 
 * Requirements: 18.2, 18.5
 */

/**
 * Formats a date string or Date object to a localized date string
 * @param date - Date string (ISO 8601) or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Failed to format date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date string or Date object to a localized datetime string
 * @param date - Date string (ISO 8601) or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted datetime string (e.g., "Jan 15, 2024, 3:45 PM")
 */
export function formatDateTime(date: string | Date, locale: string = 'en-US'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Failed to format datetime:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a user's first and last name into a full name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Formatted full name (e.g., "John Doe")
 */
export function formatUserName(firstName: string, lastName: string): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) {
    return 'Unknown User';
  }
  
  if (!first) {
    return last;
  }
  
  if (!last) {
    return first;
  }
  
  return `${first} ${last}`;
}

/**
 * Audit log action type mapping for human-readable descriptions
 */
const AUDIT_ACTION_LABELS: Record<string, string> = {
  // Authentication actions
  'auth.login': 'Logged in',
  'auth.logout': 'Logged out',
  'auth.logout_all': 'Logged out from all devices',
  'auth.register': 'Registered account',
  'auth.password_change': 'Changed password',
  'auth.password_reset_request': 'Requested password reset',
  'auth.password_reset': 'Reset password',
  'auth.mfa_enable': 'Enabled MFA',
  'auth.mfa_disable': 'Disabled MFA',
  'auth.mfa_verify': 'Verified MFA',
  'auth.session_revoke': 'Revoked session',
  'auth.token_refresh': 'Refreshed token',
  
  // User management actions
  'user.create': 'Created user',
  'user.update': 'Updated user',
  'user.delete': 'Deleted user',
  'user.transfer_ownership': 'Transferred ownership',
  
  // Permission actions
  'permission.assign': 'Assigned permissions',
  'permission.revoke': 'Revoked permissions',
  
  // Branch actions
  'branch.create': 'Created branch',
  'branch.update': 'Updated branch',
  'branch.delete': 'Deleted branch',
  'branch.assign': 'Assigned branches',
  
  // Department actions
  'department.create': 'Created department',
  'department.update': 'Updated department',
  'department.delete': 'Deleted department',
  'department.assign': 'Assigned departments',
  
  // Organization actions
  'organization.create': 'Created organization',
  'organization.update': 'Updated organization',
  'organization.delete': 'Deleted organization',
};

/**
 * Formats an audit log action into a human-readable description
 * @param action - Audit log action string (e.g., "user.create")
 * @returns Human-readable action description (e.g., "Created user")
 */
export function formatAuditLogAction(action: string): string {
  if (!action) {
    return 'Unknown action';
  }
  
  // Check if we have a predefined label
  const label = AUDIT_ACTION_LABELS[action.toLowerCase()];
  if (label) {
    return label;
  }
  
  // Fallback: Convert action to title case
  // e.g., "user.create" -> "User Create"
  return action
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a relative time string (e.g., "2 hours ago", "just now")
 * @param date - Date string (ISO 8601) or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 10) {
      return 'just now';
    } else if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffMin === 1) {
      return '1 minute ago';
    } else if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    } else if (diffHour === 1) {
      return '1 hour ago';
    } else if (diffHour < 24) {
      return `${diffHour} hours ago`;
    } else if (diffDay === 1) {
      return 'yesterday';
    } else if (diffDay < 7) {
      return `${diffDay} days ago`;
    } else if (diffWeek === 1) {
      return '1 week ago';
    } else if (diffWeek < 4) {
      return `${diffWeek} weeks ago`;
    } else if (diffMonth === 1) {
      return '1 month ago';
    } else if (diffMonth < 12) {
      return `${diffMonth} months ago`;
    } else if (diffYear === 1) {
      return '1 year ago';
    } else {
      return `${diffYear} years ago`;
    }
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return 'Invalid date';
  }
}
