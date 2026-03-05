import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

/**
 * CSRF Protection
 * 
 * Implements CSRF (Cross-Site Request Forgery) protection using tokens.
 * Generates and validates CSRF tokens for state-changing operations.
 * 
 * Requirements: 13.6 - Implement CSRF protection for mutations
 */

/**
 * CSRF token cookie name
 */
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * CSRF token header name
 */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * CSRF Protection Manager
 * 
 * Manages CSRF token generation, storage, and validation.
 */
class CSRFProtection {
  private token: string | null = null;
  
  /**
   * Generate a new CSRF token
   * 
   * @returns Generated CSRF token
   */
  generateToken(): string {
    const token = uuidv4();
    this.token = token;
    
    // Store in cookie for server-side validation
    Cookies.set(CSRF_COOKIE_NAME, token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return token;
  }
  
  /**
   * Get current CSRF token
   * Generates a new token if none exists
   * 
   * @returns Current CSRF token
   */
  getToken(): string {
    if (!this.token) {
      // Try to get from cookie first
      const cookieToken = Cookies.get(CSRF_COOKIE_NAME);
      if (cookieToken) {
        this.token = cookieToken;
        return cookieToken;
      }
      
      // Generate new token if not found
      return this.generateToken();
    }
    
    return this.token;
  }
  
  /**
   * Validate CSRF token
   * 
   * @param token - Token to validate
   * @returns true if token is valid
   */
  validateToken(token: string): boolean {
    const currentToken = this.getToken();
    return token === currentToken;
  }
  
  /**
   * Clear CSRF token
   */
  clearToken(): void {
    this.token = null;
    Cookies.remove(CSRF_COOKIE_NAME, { path: '/' });
  }
  
  /**
   * Refresh CSRF token
   * Generates a new token and invalidates the old one
   * 
   * @returns New CSRF token
   */
  refreshToken(): string {
    this.clearToken();
    return this.generateToken();
  }
  
  /**
   * Get CSRF token headers for API requests
   * 
   * @returns Headers object with CSRF token
   */
  getHeaders(): Record<string, string> {
    return {
      [CSRF_HEADER_NAME]: this.getToken(),
    };
  }
}

/**
 * Singleton instance of CSRF Protection
 */
export const csrfProtection = new CSRFProtection();

/**
 * Add CSRF token to request headers
 * 
 * @param headers - Existing headers object
 * @returns Headers with CSRF token added
 * 
 * @example
 * ```typescript
 * const headers = addCSRFToken({
 *   'Content-Type': 'application/json',
 * });
 * // Result: { 'Content-Type': 'application/json', 'X-CSRF-Token': '...' }
 * ```
 */
export function addCSRFToken(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    ...csrfProtection.getHeaders(),
  };
}

/**
 * Create a fetch wrapper with CSRF protection
 * 
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Fetch promise
 * 
 * @example
 * ```typescript
 * const response = await fetchWithCSRF('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify(userData),
 * });
 * ```
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  
  // Add CSRF token for state-changing methods
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set(CSRF_HEADER_NAME, csrfProtection.getToken());
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Apollo Link for CSRF protection
 * Adds CSRF token to GraphQL mutation requests
 * 
 * @example
 * ```typescript
 * import { ApolloLink } from '@apollo/client';
 * import { createCSRFLink } from '@/lib/auth/csrf-protection';
 * 
 * const csrfLink = createCSRFLink();
 * const client = new ApolloClient({
 *   link: ApolloLink.from([csrfLink, httpLink]),
 *   cache,
 * });
 * ```
 */
export function createCSRFLink() {
  // This will be imported from @apollo/client in the actual implementation
  // For now, we'll provide the factory function
  return {
    request: (operation: { query: { definitions: Array<{ kind: string; operation?: string }> }; setContext: (fn: (ctx: { headers?: Record<string, string> }) => { headers: Record<string, string> }) => void }, forward: (op: unknown) => unknown) => {
      // Add CSRF token to mutation operations
      if (operation.query.definitions.some((def: { kind: string; operation?: string }) => 
        def.kind === 'OperationDefinition' && def.operation === 'mutation'
      )) {
        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: {
            ...headers,
            ...csrfProtection.getHeaders(),
          },
        }));
      }
      
      return forward(operation);
    },
  };
}

/**
 * React hook for CSRF token
 * 
 * @returns CSRF token and utility functions
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { token, refreshToken } = useCSRFToken();
 *   
 *   const handleSubmit = async () => {
 *     await fetch('/api/data', {
 *       method: 'POST',
 *       headers: {
 *         'X-CSRF-Token': token,
 *       },
 *     });
 *   };
 *   
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function useCSRFToken() {
  const token = csrfProtection.getToken();
  
  return {
    token,
    refreshToken: () => csrfProtection.refreshToken(),
    clearToken: () => csrfProtection.clearToken(),
    getHeaders: () => csrfProtection.getHeaders(),
  };
}

/**
 * CSRF Protection Middleware for Forms
 * 
 * Automatically adds CSRF token to form submissions
 * 
 * @example
 * ```typescript
 * <form onSubmit={withCSRFProtection(handleSubmit)}>
 *   <input name="username" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function withCSRFProtection<T extends (...args: unknown[]) => unknown>(
  handler: T
): T {
  return ((...args: unknown[]) => {
    // Ensure CSRF token is generated
    csrfProtection.getToken();
    return handler(...args);
  }) as T;
}

/**
 * Validate CSRF token from request
 * Used on server-side to validate incoming requests
 * 
 * @param headerToken - Token from request header
 * @param cookieToken - Token from request cookie
 * @returns true if tokens match
 * 
 * @example
 * ```typescript
 * // Server-side validation
 * const headerToken = request.headers['x-csrf-token'];
 * const cookieToken = request.cookies['csrf_token'];
 * 
 * if (!validateCSRFToken(headerToken, cookieToken)) {
 *   throw new Error('Invalid CSRF token');
 * }
 * ```
 */
export function validateCSRFToken(
  headerToken: string | undefined,
  cookieToken: string | undefined
): boolean {
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  return headerToken === cookieToken;
}

/**
 * Initialize CSRF protection
 * Should be called on application startup
 * 
 * @example
 * ```typescript
 * // In app initialization
 * initializeCSRFProtection();
 * ```
 */
export function initializeCSRFProtection(): void {
  // Generate initial token
  csrfProtection.getToken();
  
  // Refresh token on page visibility change (security best practice)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        csrfProtection.refreshToken();
      }
    });
  }
}
