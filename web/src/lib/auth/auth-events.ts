import { EventEmitter } from 'events';

/**
 * Authentication Event Emitter
 * 
 * Centralized event system for authentication-related events:
 * - Token management events
 * - Authentication state changes
 * - Security events
 * - MFA events
 * - Permission changes
 * - Session events
 */

interface AuthEvents {
  // Token events
  'tokens:updated': (tokens: any) => void;
  'tokens:refreshed': (tokens: any) => void;
  'tokens:refresh_failed': (error: any) => void;
  'tokens:cleared': () => void;
  'tokens:synced': (tokens: any) => void;

  // Authentication events
  'auth:login': (user: any) => void;
  'auth:logout': (reason?: { reason: string }) => void;
  'auth:register': (user: any) => void;
  'auth:session_expired': () => void;
  'auth:permission_denied': (data: { operation?: string; error: string }) => void;

  // MFA events
  'auth:mfa_required': (data: { mfaToken?: string; userId?: string }) => void;
  'auth:mfa_enabled': () => void;
  'auth:mfa_disabled': () => void;
  'auth:mfa_verified': () => void;

  // Security events
  'security:risk_score_changed': (data: { score: number; level: string }) => void;
  'security:device_trust_changed': (data: { trusted: boolean; score: number }) => void;
  'security:suspicious_activity': (data: any) => void;
  'security:account_locked': () => void;
  'security:account_unlocked': () => void;

  // Permission events
  'permissions:updated': (permissions: string[]) => void;
  'permissions:granted': (permission: string) => void;
  'permissions:revoked': (permission: string) => void;
  'role:assigned': (role: string) => void;

  // Social auth events
  'social:provider_linked': (provider: string) => void;
  'social:provider_unlinked': (provider: string) => void;

  // Session events
  'session:created': (sessionId: string) => void;
  'session:expired': (sessionId: string) => void;
  'session:revoked': (sessionId: string) => void;

  // Tier events
  'tier:upgraded': (newTier: string) => void;
  'tier:downgraded': (newTier: string) => void;
  'tier:feature_locked': (feature: string) => void;

  // Network events
  'network:online': () => void;
  'network:offline': () => void;
  'network:reconnected': () => void;
}

class AuthEventEmitterClass extends EventEmitter {
  private static instance: AuthEventEmitterClass;

  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for complex apps
  }

  static getInstance(): AuthEventEmitterClass {
    if (!AuthEventEmitterClass.instance) {
      AuthEventEmitterClass.instance = new AuthEventEmitterClass();
    }
    return AuthEventEmitterClass.instance;
  }

  // Type-safe event emission
  emit<K extends keyof AuthEvents>(event: K, ...args: Parameters<AuthEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  // Type-safe event listening
  on<K extends keyof AuthEvents>(event: K, listener: AuthEvents[K]): this {
    return super.on(event, listener);
  }

  // Type-safe one-time event listening
  once<K extends keyof AuthEvents>(event: K, listener: AuthEvents[K]): this {
    return super.once(event, listener);
  }

  // Type-safe event removal
  off<K extends keyof AuthEvents>(event: K, listener: AuthEvents[K]): this {
    return super.off(event, listener);
  }

  // Remove all listeners for an event
  removeAllListeners<K extends keyof AuthEvents>(event?: K): this {
    return super.removeAllListeners(event);
  }

  /**
   * Setup global error handling for authentication events
   */
  setupGlobalHandlers(): void {
    // Handle logout events
    this.on('auth:logout', (data) => {
      console.log('User logged out:', data?.reason || 'manual');
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear Apollo cache
        const { apolloClient } = require('../graphql/client');
        apolloClient.clearStore();
        
        // Redirect to login page
        window.location.href = '/auth';
      }
    });

    // Handle session expiration
    this.on('auth:session_expired', () => {
      console.log('Session expired');
      this.emit('auth:logout', { reason: 'session_expired' });
    });

    // Handle permission denied
    this.on('auth:permission_denied', (data) => {
      console.warn('Permission denied:', data);
      
      // Show notification or redirect
      if (typeof window !== 'undefined') {
        // You can integrate with your notification system here
        console.warn(`Access denied: ${data.error}`);
      }
    });

    // Handle MFA required
    this.on('auth:mfa_required', (data) => {
      console.log('MFA required for authentication');
      
      // Redirect to MFA page or show MFA modal
      if (typeof window !== 'undefined') {
        // Store MFA data for the flow
        sessionStorage.setItem('mfa_data', JSON.stringify(data));
        window.location.href = '/auth/mfa';
      }
    });

    // Handle network events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.emit('network:online');
      });

      window.addEventListener('offline', () => {
        this.emit('network:offline');
      });
    }

    // Handle security events
    this.on('security:account_locked', () => {
      console.warn('Account has been locked due to security concerns');
      this.emit('auth:logout', { reason: 'account_locked' });
    });

    this.on('security:suspicious_activity', (data) => {
      console.warn('Suspicious activity detected:', data);
      // You might want to show a security warning to the user
    });
  }

  /**
   * Debug helper to log all events
   */
  enableDebugMode(): void {
    const originalEmit = this.emit;
    
    this.emit = function<K extends keyof AuthEvents>(event: K, ...args: Parameters<AuthEvents[K]>): boolean {
      console.log(`[AuthEvent] ${event}:`, ...args);
      return originalEmit.call(this, event, ...args);
    };
  }

  /**
   * Get event statistics
   */
  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const event of this.eventNames()) {
      stats[event.toString()] = this.listenerCount(event);
    }
    
    return stats;
  }
}

// Export singleton instance
export const AuthEventEmitter = AuthEventEmitterClass.getInstance();

// Setup global handlers if in browser
if (typeof window !== 'undefined') {
  AuthEventEmitter.setupGlobalHandlers();
  
  // Enable debug mode in development
  if (process.env.NODE_ENV === 'development') {
    AuthEventEmitter.enableDebugMode();
  }
}