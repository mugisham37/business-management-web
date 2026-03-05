/**
 * Production Log Filter
 * 
 * Filters sensitive data from logs in production environments.
 * Removes tokens, passwords, PII, and other sensitive information.
 * 
 * Requirements: 13.8 - Filter sensitive data from logs in production
 */

/**
 * Sensitive data patterns to filter
 */
const SENSITIVE_PATTERNS = {
  // Tokens
  accessToken: /access[_-]?token/i,
  refreshToken: /refresh[_-]?token/i,
  bearerToken: /bearer\s+[a-zA-Z0-9\-._~+/]+=*/i,
  jwtToken: /eyJ[a-zA-Z0-9\-._~+/]+=*/g,
  
  // Passwords
  password: /password/i,
  currentPassword: /current[_-]?password/i,
  newPassword: /new[_-]?password/i,
  pin: /\bpin\b/i,
  
  // Personal Information
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  ssn: /\d{3}-\d{2}-\d{4}/g,
  creditCard: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
  
  // API Keys
  apiKey: /api[_-]?key/i,
  secretKey: /secret[_-]?key/i,
  privateKey: /private[_-]?key/i,
  
  // Session IDs
  sessionId: /session[_-]?id/i,
  csrf: /csrf[_-]?token/i,
};

/**
 * Replacement text for filtered data
 */
const REDACTED = '[REDACTED]';

/**
 * Log Filter Configuration
 */
export interface LogFilterConfig {
  /**
   * Enable filtering (automatically enabled in production)
   */
  enabled: boolean;
  
  /**
   * Additional patterns to filter
   */
  customPatterns?: Record<string, RegExp>;
  
  /**
   * Fields to always filter (in addition to pattern matching)
   */
  sensitiveFields?: string[];
  
  /**
   * Replacement text for filtered data
   */
  redactedText?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LogFilterConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sensitiveFields: [
    'password',
    'currentPassword',
    'newPassword',
    'pin',
    'accessToken',
    'refreshToken',
    'token',
    'apiKey',
    'secretKey',
    'privateKey',
    'sessionId',
    'csrfToken',
  ],
  redactedText: REDACTED,
};

/**
 * Log Filter
 * 
 * Filters sensitive data from log messages and objects.
 */
class LogFilter {
  private config: LogFilterConfig;
  
  constructor(config: Partial<LogFilterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Filter sensitive data from a string
   * 
   * @param text - Text to filter
   * @returns Filtered text
   */
  filterString(text: string): string {
    if (!this.config.enabled) {
      return text;
    }
    
    let filtered = text;
    
    // Apply pattern-based filtering
    for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
      filtered = filtered.replace(pattern, this.config.redactedText || REDACTED);
    }
    
    // Apply custom patterns
    if (this.config.customPatterns) {
      for (const pattern of Object.values(this.config.customPatterns)) {
        filtered = filtered.replace(pattern, this.config.redactedText || REDACTED);
      }
    }
    
    return filtered;
  }
  
  /**
   * Filter sensitive data from an object
   * 
   * @param obj - Object to filter
   * @returns Filtered object
   */
  filterObject<T extends Record<string, unknown>>(obj: T): T {
    if (!this.config.enabled) {
      return obj;
    }
    
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const filtered: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if field is sensitive
      if (this.isSensitiveField(key)) {
        filtered[key] = this.config.redactedText || REDACTED;
      } else if (typeof value === 'string') {
        filtered[key] = this.filterString(value);
      } else if (Array.isArray(value)) {
        filtered[key] = value.map((item) =>
          typeof item === 'object' ? this.filterObject(item) : item
        );
      } else if (value && typeof value === 'object') {
        filtered[key] = this.filterObject(value as Record<string, unknown>);
      } else {
        filtered[key] = value;
      }
    }
    
    return filtered as T;
  }
  
  /**
   * Filter sensitive data from an array
   * 
   * @param arr - Array to filter
   * @returns Filtered array
   */
  filterArray<T>(arr: T[]): T[] {
    if (!this.config.enabled) {
      return arr;
    }
    
    return arr.map((item) => {
      if (typeof item === 'string') {
        return this.filterString(item) as T;
      } else if (item && typeof item === 'object') {
        return this.filterObject(item as Record<string, unknown>) as T;
      }
      return item;
    });
  }
  
  /**
   * Check if a field name is sensitive
   * 
   * @param fieldName - Field name to check
   * @returns true if field is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    
    // Check against configured sensitive fields
    if (this.config.sensitiveFields) {
      for (const sensitive of this.config.sensitiveFields) {
        if (lowerField.includes(sensitive.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check against pattern names
    for (const patternName of Object.keys(SENSITIVE_PATTERNS)) {
      if (lowerField.includes(patternName.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }
}

/**
 * Singleton instance of Log Filter
 */
export const logFilter = new LogFilter();

/**
 * Safe console.log that filters sensitive data
 * 
 * @param args - Arguments to log
 * 
 * @example
 * ```typescript
 * safeLog('User data:', { email: 'user@example.com', password: 'secret123' });
 * // Output: User data: { email: '[REDACTED]', password: '[REDACTED]' }
 * ```
 */
export function safeLog(...args: unknown[]): void {
  const filtered = args.map((arg) => {
    if (typeof arg === 'string') {
      return logFilter.filterString(arg);
    } else if (arg && typeof arg === 'object') {
      return logFilter.filterObject(arg as Record<string, unknown>);
    }
    return arg;
  });
  
  console.log(...filtered);
}

/**
 * Safe console.error that filters sensitive data
 * 
 * @param args - Arguments to log
 */
export function safeError(...args: unknown[]): void {
  const filtered = args.map((arg) => {
    if (typeof arg === 'string') {
      return logFilter.filterString(arg);
    } else if (arg && typeof arg === 'object') {
      return logFilter.filterObject(arg as Record<string, unknown>);
    }
    return arg;
  });
  
  console.error(...filtered);
}

/**
 * Safe console.warn that filters sensitive data
 * 
 * @param args - Arguments to log
 */
export function safeWarn(...args: unknown[]): void {
  const filtered = args.map((arg) => {
    if (typeof arg === 'string') {
      return logFilter.filterString(arg);
    } else if (arg && typeof arg === 'object') {
      return logFilter.filterObject(arg as Record<string, unknown>);
    }
    return arg;
  });
  
  console.warn(...filtered);
}

/**
 * Safe console.info that filters sensitive data
 * 
 * @param args - Arguments to log
 */
export function safeInfo(...args: unknown[]): void {
  const filtered = args.map((arg) => {
    if (typeof arg === 'string') {
      return logFilter.filterString(arg);
    } else if (arg && typeof arg === 'object') {
      return logFilter.filterObject(arg as Record<string, unknown>);
    }
    return arg;
  });
  
  console.info(...filtered);
}

/**
 * Create a safe logger instance
 * 
 * @param config - Custom configuration
 * @returns Safe logger object
 * 
 * @example
 * ```typescript
 * const logger = createSafeLogger({
 *   customPatterns: {
 *     customSecret: /custom[_-]?secret/i,
 *   },
 * });
 * 
 * logger.log('Data:', { customSecret: 'value' });
 * // Output: Data: { customSecret: '[REDACTED]' }
 * ```
 */
export function createSafeLogger(config?: Partial<LogFilterConfig>) {
  const filter = new LogFilter(config);
  
  return {
    log: (...args: unknown[]) => {
      const filtered = args.map((arg) =>
        typeof arg === 'object' && arg !== null ? filter.filterObject(arg as Record<string, unknown>) : filter.filterString(String(arg))
      );
      console.log(...filtered);
    },
    error: (...args: unknown[]) => {
      const filtered = args.map((arg) =>
        typeof arg === 'object' && arg !== null ? filter.filterObject(arg as Record<string, unknown>) : filter.filterString(String(arg))
      );
      console.error(...filtered);
    },
    warn: (...args: unknown[]) => {
      const filtered = args.map((arg) =>
        typeof arg === 'object' && arg !== null ? filter.filterObject(arg as Record<string, unknown>) : filter.filterString(String(arg))
      );
      console.warn(...filtered);
    },
    info: (...args: unknown[]) => {
      const filtered = args.map((arg) =>
        typeof arg === 'object' && arg !== null ? filter.filterObject(arg as Record<string, unknown>) : filter.filterString(String(arg))
      );
      console.info(...filtered);
    },
  };
}

/**
 * Override global console methods with safe versions
 * Should be called early in application initialization
 * 
 * @example
 * ```typescript
 * // In app initialization
 * if (process.env.NODE_ENV === 'production') {
 *   overrideConsole();
 * }
 * ```
 */
export function overrideConsole(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  
  console.log = safeLog;
  console.error = safeError;
  console.warn = safeWarn;
  console.info = safeInfo;
  
  // Store original methods for debugging if needed
  (console as unknown as Record<string, unknown>)._originalLog = originalLog;
  (console as unknown as Record<string, unknown>)._originalError = originalError;
  (console as unknown as Record<string, unknown>)._originalWarn = originalWarn;
  (console as unknown as Record<string, unknown>)._originalInfo = originalInfo;
}

/**
 * Restore original console methods
 * Useful for debugging in production
 */
export function restoreConsole(): void {
  const c = console as unknown as Record<string, unknown>;
  if (c._originalLog) {
    console.log = c._originalLog as typeof console.log;
    console.error = c._originalError as typeof console.error;
    console.warn = c._originalWarn as typeof console.warn;
    console.info = c._originalInfo as typeof console.info;
  }
}
