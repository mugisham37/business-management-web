import DOMPurify from 'isomorphic-dompurify';

/**
 * Input Sanitizer
 * 
 * Provides utilities for sanitizing user inputs to prevent XSS attacks.
 * Uses DOMPurify to remove dangerous HTML/JavaScript from user inputs.
 * 
 * Requirements: 13.2 - Sanitize user inputs to prevent XSS attacks
 */

/**
 * Sanitization configuration options
 */
export interface SanitizeOptions {
  /**
   * Allow HTML tags (default: false)
   */
  allowHtml?: boolean;
  
  /**
   * Allowed HTML tags (only used if allowHtml is true)
   */
  allowedTags?: string[];
  
  /**
   * Allowed HTML attributes (only used if allowHtml is true)
   */
  allowedAttributes?: string[];
  
  /**
   * Strip all HTML tags (default: true)
   */
  stripTags?: boolean;
}

/**
 * Default sanitization configuration
 */
const DEFAULT_OPTIONS: SanitizeOptions = {
  allowHtml: false,
  stripTags: true,
};

/**
 * Sanitizes a string input to prevent XSS attacks
 * 
 * @param input - String to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeString(userInput);
 * // Result: 'Hello'
 * ```
 */
export function sanitizeString(
  input: string,
  options: SanitizeOptions = DEFAULT_OPTIONS
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const config: DOMPurify.Config = {};
  
  if (options.allowHtml && options.allowedTags) {
    config.ALLOWED_TAGS = options.allowedTags;
  } else if (!options.allowHtml || options.stripTags) {
    config.ALLOWED_TAGS = [];
  }
  
  if (options.allowHtml && options.allowedAttributes) {
    config.ALLOWED_ATTR = options.allowedAttributes;
  } else if (!options.allowHtml || options.stripTags) {
    config.ALLOWED_ATTR = [];
  }
  
  return DOMPurify.sanitize(input, config);
}

/**
 * Sanitizes an object by sanitizing all string values
 * 
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 * 
 * @example
 * ```typescript
 * const userInput = {
 *   name: '<script>alert("XSS")</script>John',
 *   email: 'john@example.com',
 *   bio: '<b>Developer</b>',
 * };
 * const safe = sanitizeObject(userInput);
 * // Result: { name: 'John', email: 'john@example.com', bio: 'Developer' }
 * ```
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = DEFAULT_OPTIONS
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value, options);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Sanitizes an array by sanitizing all string values
 * 
 * @param arr - Array to sanitize
 * @param options - Sanitization options
 * @returns Sanitized array
 * 
 * @example
 * ```typescript
 * const userInput = ['<script>alert("XSS")</script>Hello', 'World'];
 * const safe = sanitizeArray(userInput);
 * // Result: ['Hello', 'World']
 * ```
 */
export function sanitizeArray<T>(
  arr: T[],
  options: SanitizeOptions = DEFAULT_OPTIONS
): T[] {
  if (!Array.isArray(arr)) {
    return arr;
  }
  
  return arr.map((item) => {
    if (typeof item === 'string') {
      return sanitizeString(item, options) as T;
    } else if (Array.isArray(item)) {
      return sanitizeArray(item, options) as T;
    } else if (item && typeof item === 'object') {
      return sanitizeObject(item as Record<string, unknown>, options) as T;
    }
    return item;
  });
}

/**
 * Sanitizes HTML content while preserving safe tags
 * 
 * @param html - HTML string to sanitize
 * @param allowedTags - Array of allowed HTML tags (default: basic formatting tags)
 * @returns Sanitized HTML string
 * 
 * @example
 * ```typescript
 * const userHtml = '<p>Hello</p><script>alert("XSS")</script>';
 * const safe = sanitizeHtml(userHtml);
 * // Result: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li']
): string {
  return sanitizeString(html, {
    allowHtml: true,
    allowedTags,
    allowedAttributes: ['href', 'title', 'target'],
    stripTags: false,
  });
}

/**
 * Sanitizes a URL to prevent javascript: and data: URLs
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if dangerous
 * 
 * @example
 * ```typescript
 * const userUrl = 'javascript:alert("XSS")';
 * const safe = sanitizeUrl(userUrl);
 * // Result: ''
 * 
 * const validUrl = 'https://example.com';
 * const safe2 = sanitizeUrl(validUrl);
 * // Result: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }
  
  // Allow http, https, mailto, tel, and relative URLs
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', '//', '/'];
  const isSafe = safeProtocols.some((protocol) => trimmed.startsWith(protocol)) || 
                 !trimmed.includes(':');
  
  return isSafe ? url.trim() : '';
}

/**
 * Sanitizes form data before submission
 * 
 * @param formData - Form data object to sanitize
 * @param fieldsToSkip - Array of field names to skip sanitization (e.g., passwords)
 * @returns Sanitized form data
 * 
 * @example
 * ```typescript
 * const formData = {
 *   username: '<script>alert("XSS")</script>john',
 *   password: 'myP@ssw0rd!',
 *   bio: '<b>Developer</b>',
 * };
 * const safe = sanitizeFormData(formData, ['password']);
 * // Result: { username: 'john', password: 'myP@ssw0rd!', bio: 'Developer' }
 * ```
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  formData: T,
  fieldsToSkip: string[] = ['password', 'currentPassword', 'newPassword', 'pin']
): T {
  if (!formData || typeof formData !== 'object') {
    return formData;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (fieldsToSkip.includes(key)) {
      // Skip sanitization for sensitive fields
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Creates a sanitization function for a specific configuration
 * 
 * @param options - Sanitization options
 * @returns Sanitization function
 * 
 * @example
 * ```typescript
 * const sanitizeUserInput = createSanitizer({ stripTags: true });
 * 
 * // Later in code
 * const safe = sanitizeUserInput(userInput);
 * ```
 */
export function createSanitizer(
  options: SanitizeOptions = DEFAULT_OPTIONS
): (input: string) => string {
  return (input: string) => sanitizeString(input, options);
}
