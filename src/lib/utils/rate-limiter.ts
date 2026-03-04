/**
 * Client-Side Rate Limiter
 * 
 * Implements client-side rate limiting for API calls.
 * Prevents excessive requests and shows user-friendly messages when rate limited.
 * 
 * Requirements: 13.9 - Implement client-side rate limiting for API calls
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Message to show when rate limited
   */
  message?: string;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate Limiter
 * 
 * Tracks and enforces rate limits for API endpoints.
 */
class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start cleanup interval to remove expired entries
    this.startCleanup();
  }
  
  /**
   * Check if a request is allowed
   * 
   * @param key - Unique key for the rate limit (e.g., endpoint URL)
   * @param config - Rate limit configuration
   * @returns Object with allowed flag and remaining requests
   */
  check(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    // No entry or expired entry
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: config.message || this.getDefaultMessage(entry.resetTime),
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
  
  /**
   * Reset rate limit for a key
   * 
   * @param key - Rate limit key to reset
   */
  reset(key: string): void {
    this.limits.delete(key);
  }
  
  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }
  
  /**
   * Get remaining requests for a key
   * 
   * @param key - Rate limit key
   * @param maxRequests - Maximum requests allowed
   * @returns Remaining requests
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() >= entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }
  
  /**
   * Get time until rate limit resets
   * 
   * @param key - Rate limit key
   * @returns Milliseconds until reset, or 0 if not rate limited
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return 0;
    }
    return Math.max(0, entry.resetTime - Date.now());
  }
  
  /**
   * Get default rate limit message
   */
  private getDefaultMessage(resetTime: number): string {
    const seconds = Math.ceil((resetTime - Date.now()) / 1000);
    return `Too many requests. Please try again in ${seconds} seconds.`;
  }
  
  /**
   * Start cleanup interval to remove expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (now >= entry.resetTime) {
          this.limits.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
  
  /**
   * Stop cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Singleton instance of Rate Limiter
 */
export const rateLimiter = new RateLimiter();

/**
 * Default rate limit configurations for different endpoint types
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  login: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    message: 'Too many login attempts. Please try again in a minute.',
  },
  register: {
    maxRequests: 3,
    windowMs: 300000, // 5 minutes
    message: 'Too many registration attempts. Please try again later.',
  },
  passwordReset: {
    maxRequests: 3,
    windowMs: 300000, // 5 minutes
    message: 'Too many password reset requests. Please try again later.',
  },
  
  // API endpoints
  mutation: {
    maxRequests: 30,
    windowMs: 60000, // 1 minute
    message: 'Too many requests. Please slow down.',
  },
  query: {
    maxRequests: 60,
    windowMs: 60000, // 1 minute
    message: 'Too many requests. Please slow down.',
  },
  
  // Search endpoints
  search: {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
    message: 'Too many search requests. Please slow down.',
  },
};

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number,
    public remaining: number = 0
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Create a rate-limited function
 * 
 * @param fn - Function to rate limit
 * @param key - Unique key for rate limiting
 * @param config - Rate limit configuration
 * @returns Rate-limited function
 * 
 * @example
 * ```typescript
 * const rateLimitedLogin = createRateLimitedFunction(
 *   loginUser,
 *   'login',
 *   DEFAULT_RATE_LIMITS.login
 * );
 * 
 * try {
 *   await rateLimitedLogin(credentials);
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     showError(error.message);
 *   }
 * }
 * ```
 */
export function createRateLimitedFunction<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  config: RateLimitConfig
): T {
  return ((...args: any[]) => {
    const result = rateLimiter.check(key, config);
    
    if (!result.allowed) {
      throw new RateLimitError(
        result.message || 'Rate limit exceeded',
        result.resetTime,
        result.remaining
      );
    }
    
    return fn(...args);
  }) as T;
}

/**
 * Rate limit decorator for async functions
 * 
 * @param key - Unique key for rate limiting
 * @param config - Rate limit configuration
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class AuthService {
 *   @rateLimit('login', DEFAULT_RATE_LIMITS.login)
 *   async login(credentials: LoginInput) {
 *     // Login logic
 *   }
 * }
 * ```
 */
export function rateLimit(key: string, config: RateLimitConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = rateLimiter.check(key, config);
      
      if (!result.allowed) {
        throw new RateLimitError(
          result.message || 'Rate limit exceeded',
          result.resetTime,
          result.remaining
        );
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * React hook for rate limiting
 * 
 * @param key - Unique key for rate limiting
 * @param config - Rate limit configuration
 * @returns Rate limit state and check function
 * 
 * @example
 * ```typescript
 * function LoginForm() {
 *   const { check, remaining, resetTime, isLimited } = useRateLimit(
 *     'login',
 *     DEFAULT_RATE_LIMITS.login
 *   );
 *   
 *   const handleSubmit = async () => {
 *     const result = check();
 *     if (!result.allowed) {
 *       showError(result.message);
 *       return;
 *     }
 *     
 *     await login(credentials);
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSubmit} disabled={isLimited}>
 *         Login
 *       </button>
 *       {isLimited && <p>Too many attempts. Try again later.</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  const check = () => rateLimiter.check(key, config);
  const remaining = rateLimiter.getRemaining(key, config.maxRequests);
  const timeUntilReset = rateLimiter.getTimeUntilReset(key);
  const isLimited = remaining === 0 && timeUntilReset > 0;
  
  return {
    check,
    remaining,
    resetTime: Date.now() + timeUntilReset,
    timeUntilReset,
    isLimited,
    reset: () => rateLimiter.reset(key),
  };
}

/**
 * Fetch wrapper with rate limiting
 * 
 * @param url - Request URL
 * @param options - Fetch options
 * @param rateLimitKey - Rate limit key (defaults to URL)
 * @param rateLimitConfig - Rate limit configuration
 * @returns Fetch promise
 * 
 * @example
 * ```typescript
 * const response = await fetchWithRateLimit(
 *   '/api/users',
 *   { method: 'POST', body: JSON.stringify(data) },
 *   'create-user',
 *   DEFAULT_RATE_LIMITS.mutation
 * );
 * ```
 */
export async function fetchWithRateLimit(
  url: string,
  options: RequestInit = {},
  rateLimitKey?: string,
  rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMITS.mutation
): Promise<Response> {
  const key = rateLimitKey || url;
  const result = rateLimiter.check(key, rateLimitConfig);
  
  if (!result.allowed) {
    throw new RateLimitError(
      result.message || 'Rate limit exceeded',
      result.resetTime,
      result.remaining
    );
  }
  
  return fetch(url, options);
}

/**
 * Apollo Link for rate limiting GraphQL operations
 * 
 * @param config - Default rate limit configuration
 * @returns Apollo Link
 * 
 * @example
 * ```typescript
 * import { ApolloLink } from '@apollo/client';
 * import { createRateLimitLink } from '@/lib/utils/rate-limiter';
 * 
 * const rateLimitLink = createRateLimitLink({
 *   maxRequests: 30,
 *   windowMs: 60000,
 * });
 * 
 * const client = new ApolloClient({
 *   link: ApolloLink.from([rateLimitLink, httpLink]),
 *   cache,
 * });
 * ```
 */
export function createRateLimitLink(config: RateLimitConfig = DEFAULT_RATE_LIMITS.mutation) {
  return {
    request: (operation: any, forward: any) => {
      const operationType = operation.query.definitions[0]?.operation || 'query';
      const operationName = operation.operationName || 'unknown';
      const key = `${operationType}:${operationName}`;
      
      const rateLimitConfig = operationType === 'mutation'
        ? DEFAULT_RATE_LIMITS.mutation
        : DEFAULT_RATE_LIMITS.query;
      
      const result = rateLimiter.check(key, rateLimitConfig);
      
      if (!result.allowed) {
        throw new RateLimitError(
          result.message || 'Rate limit exceeded',
          result.resetTime,
          result.remaining
        );
      }
      
      return forward(operation);
    },
  };
}
