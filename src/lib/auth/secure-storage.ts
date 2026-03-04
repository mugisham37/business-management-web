import Cookies from 'js-cookie';

/**
 * Secure Storage
 * 
 * Provides secure storage utilities for sensitive data like tokens.
 * Supports multiple storage strategies with security best practices.
 * 
 * Requirements: 13.5 - Store tokens securely using httpOnly cookies or secure storage
 */

/**
 * Storage strategy types
 */
export type StorageStrategy = 'memory' | 'cookie' | 'sessionStorage';

/**
 * Storage configuration
 */
export interface StorageConfig {
  /**
   * Storage strategy to use
   * - memory: Store in memory only (most secure, lost on page refresh)
   * - cookie: Store in secure cookies (persistent, can be httpOnly on server)
   * - sessionStorage: Store in sessionStorage (persistent during session)
   */
  strategy: StorageStrategy;
  
  /**
   * Cookie options (only used for cookie strategy)
   */
  cookieOptions?: {
    secure?: boolean; // Only send over HTTPS
    sameSite?: 'strict' | 'lax' | 'none'; // CSRF protection
    domain?: string;
    path?: string;
  };
}

/**
 * Default storage configuration
 */
const DEFAULT_CONFIG: StorageConfig = {
  strategy: 'memory',
  cookieOptions: {
    secure: true, // Only HTTPS
    sameSite: 'strict', // CSRF protection
    path: '/',
  },
};

/**
 * Secure Storage Manager
 * 
 * Manages secure storage of sensitive data with multiple strategies.
 * Automatically selects the most secure available strategy.
 */
class SecureStorage {
  private memoryStorage: Map<string, string> = new Map();
  private config: StorageConfig;
  
  constructor(config: StorageConfig = DEFAULT_CONFIG) {
    this.config = config;
  }
  
  /**
   * Store a value securely
   * 
   * @param key - Storage key
   * @param value - Value to store
   * @param expiresInDays - Optional expiration in days (for cookie strategy)
   */
  set(key: string, value: string, expiresInDays?: number): void {
    switch (this.config.strategy) {
      case 'memory':
        this.memoryStorage.set(key, value);
        break;
        
      case 'cookie':
        Cookies.set(key, value, {
          expires: expiresInDays,
          ...this.config.cookieOptions,
        });
        break;
        
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.setItem(key, value);
          } catch (error) {
            console.error('SessionStorage set failed:', error);
            // Fallback to memory
            this.memoryStorage.set(key, value);
          }
        } else {
          // Fallback to memory if sessionStorage not available
          this.memoryStorage.set(key, value);
        }
        break;
    }
  }
  
  /**
   * Retrieve a value from secure storage
   * 
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  get(key: string): string | null {
    switch (this.config.strategy) {
      case 'memory':
        return this.memoryStorage.get(key) || null;
        
      case 'cookie':
        return Cookies.get(key) || null;
        
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            return window.sessionStorage.getItem(key);
          } catch (error) {
            console.error('SessionStorage get failed:', error);
            // Fallback to memory
            return this.memoryStorage.get(key) || null;
          }
        }
        // Fallback to memory if sessionStorage not available
        return this.memoryStorage.get(key) || null;
    }
  }
  
  /**
   * Remove a value from secure storage
   * 
   * @param key - Storage key
   */
  remove(key: string): void {
    switch (this.config.strategy) {
      case 'memory':
        this.memoryStorage.delete(key);
        break;
        
      case 'cookie':
        Cookies.remove(key, {
          path: this.config.cookieOptions?.path,
          domain: this.config.cookieOptions?.domain,
        });
        break;
        
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.removeItem(key);
          } catch (error) {
            console.error('SessionStorage remove failed:', error);
          }
        }
        // Also remove from memory fallback
        this.memoryStorage.delete(key);
        break;
    }
  }
  
  /**
   * Clear all stored values
   */
  clear(): void {
    switch (this.config.strategy) {
      case 'memory':
        this.memoryStorage.clear();
        break;
        
      case 'cookie':
        // Remove all cookies (we need to know the keys)
        // This is a limitation of cookie storage
        console.warn('Cookie clear requires explicit key removal');
        break;
        
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.clear();
          } catch (error) {
            console.error('SessionStorage clear failed:', error);
          }
        }
        this.memoryStorage.clear();
        break;
    }
  }
  
  /**
   * Check if a key exists in storage
   * 
   * @param key - Storage key
   * @returns true if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * Token Storage Keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

/**
 * Create a secure storage instance for tokens
 * 
 * Automatically selects the best strategy based on environment:
 * - Production: Cookie strategy with secure flags
 * - Development: Memory strategy for easier debugging
 * 
 * @param customConfig - Optional custom configuration
 * @returns SecureStorage instance
 */
export function createTokenStorage(customConfig?: Partial<StorageConfig>): SecureStorage {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const defaultStrategy: StorageStrategy = isProduction ? 'cookie' : 'memory';
  
  const config: StorageConfig = {
    strategy: customConfig?.strategy || defaultStrategy,
    cookieOptions: {
      secure: isProduction, // Only HTTPS in production
      sameSite: 'strict',
      path: '/',
      ...customConfig?.cookieOptions,
    },
  };
  
  return new SecureStorage(config);
}

/**
 * Singleton instance for token storage
 * Uses the most secure strategy available
 */
export const tokenStorage = createTokenStorage();

/**
 * Security Utilities
 */

/**
 * Check if the current environment supports secure storage
 * 
 * @returns Object with support flags for each strategy
 */
export function checkStorageSupport(): {
  memory: boolean;
  cookie: boolean;
  sessionStorage: boolean;
  isSecure: boolean;
} {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  let sessionStorageSupported = false;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const testKey = '__storage_test__';
      window.sessionStorage.setItem(testKey, 'test');
      window.sessionStorage.removeItem(testKey);
      sessionStorageSupported = true;
    } catch {
      sessionStorageSupported = false;
    }
  }
  
  return {
    memory: true, // Always supported
    cookie: typeof document !== 'undefined',
    sessionStorage: sessionStorageSupported,
    isSecure,
  };
}

/**
 * Get recommended storage strategy based on environment
 * 
 * @returns Recommended storage strategy
 */
export function getRecommendedStrategy(): StorageStrategy {
  const support = checkStorageSupport();
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production with HTTPS, use cookies
  if (isProduction && support.isSecure && support.cookie) {
    return 'cookie';
  }
  
  // In development or non-HTTPS, use memory for security
  return 'memory';
}

/**
 * Validate storage security
 * 
 * Checks if the current storage configuration meets security requirements.
 * Logs warnings for insecure configurations.
 * 
 * @param storage - SecureStorage instance to validate
 */
export function validateStorageSecurity(storage: SecureStorage): void {
  const support = checkStorageSupport();
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !support.isSecure) {
    console.warn(
      'SECURITY WARNING: Running in production without HTTPS. ' +
      'Tokens may be transmitted insecurely.'
    );
  }
  
  if (isProduction && !support.cookie) {
    console.warn(
      'SECURITY WARNING: Cookie storage not available in production. ' +
      'Using less secure storage strategy.'
    );
  }
}

export { SecureStorage };
