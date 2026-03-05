/**
 * Security Event Logger
 * 
 * Logs security-relevant events for audit and monitoring purposes.
 * Includes user ID, timestamp, action details, and context.
 * 
 * Requirements: 13.7 - Log security-relevant events (login, logout, permission changes)
 */

/**
 * Security event types
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization events
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  PERMISSION_CHECK_FAILED = 'PERMISSION_CHECK_FAILED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  
  // Account events
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  
  // Security events
  CSRF_TOKEN_MISMATCH = 'CSRF_TOKEN_MISMATCH',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Security event severity levels
 */
export enum SecurityEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Security event data structure
 */
export interface SecurityEvent {
  /**
   * Event type
   */
  type: SecurityEventType;
  
  /**
   * Event severity
   */
  severity: SecurityEventSeverity;
  
  /**
   * Timestamp (ISO 8601)
   */
  timestamp: string;
  
  /**
   * User ID (if available)
   */
  userId?: string;
  
  /**
   * User email (if available)
   */
  userEmail?: string;
  
  /**
   * Organization ID (if available)
   */
  organizationId?: string;
  
  /**
   * Action details
   */
  action: string;
  
  /**
   * Resource affected (if applicable)
   */
  resource?: string;
  
  /**
   * Additional context
   */
  metadata?: Record<string, unknown>;
  
  /**
   * IP address (if available)
   */
  ipAddress?: string;
  
  /**
   * User agent (if available)
   */
  userAgent?: string;
  
  /**
   * Session ID (if available)
   */
  sessionId?: string;
}

/**
 * Security Logger Configuration
 */
export interface SecurityLoggerConfig {
  /**
   * Enable console logging
   */
  consoleLogging: boolean;
  
  /**
   * Enable remote logging (send to backend)
   */
  remoteLogging: boolean;
  
  /**
   * Remote logging endpoint
   */
  remoteEndpoint?: string;
  
  /**
   * Minimum severity level to log
   */
  minSeverity: SecurityEventSeverity;
  
  /**
   * Include sensitive data in logs (disable in production)
   */
  includeSensitiveData: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SecurityLoggerConfig = {
  consoleLogging: process.env.NODE_ENV !== 'production',
  remoteLogging: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/security/events',
  minSeverity: SecurityEventSeverity.INFO,
  includeSensitiveData: process.env.NODE_ENV !== 'production',
};

/**
 * Security Logger
 * 
 * Manages security event logging with configurable output destinations.
 */
class SecurityLogger {
  private config: SecurityLoggerConfig;
  private eventQueue: SecurityEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor(config: Partial<SecurityLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Start flush interval for remote logging
    if (this.config.remoteLogging) {
      this.startFlushInterval();
    }
  }
  
  /**
   * Log a security event
   * 
   * @param event - Security event to log
   */
  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
    };
    
    // Check severity threshold
    if (!this.shouldLog(fullEvent.severity)) {
      return;
    }
    
    // Filter sensitive data in production
    const sanitizedEvent = this.sanitizeEvent(fullEvent);
    
    // Console logging
    if (this.config.consoleLogging) {
      this.logToConsole(sanitizedEvent);
    }
    
    // Remote logging
    if (this.config.remoteLogging) {
      this.eventQueue.push(sanitizedEvent);
    }
  }
  
  /**
   * Log authentication success
   */
  logLoginSuccess(userId: string, userEmail: string, organizationId: string): void {
    this.log({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SecurityEventSeverity.INFO,
      userId,
      userEmail,
      organizationId,
      action: 'User logged in successfully',
    });
  }
  
  /**
   * Log authentication failure
   */
  logLoginFailure(email: string, reason: string): void {
    this.log({
      type: SecurityEventType.LOGIN_FAILURE,
      severity: SecurityEventSeverity.WARNING,
      userEmail: email,
      action: 'Login attempt failed',
      metadata: { reason },
    });
  }
  
  /**
   * Log logout
   */
  logLogout(userId: string, userEmail: string): void {
    this.log({
      type: SecurityEventType.LOGOUT,
      severity: SecurityEventSeverity.INFO,
      userId,
      userEmail,
      action: 'User logged out',
    });
  }
  
  /**
   * Log token refresh
   */
  logTokenRefresh(userId: string): void {
    this.log({
      type: SecurityEventType.TOKEN_REFRESH,
      severity: SecurityEventSeverity.INFO,
      userId,
      action: 'Access token refreshed',
    });
  }
  
  /**
   * Log token refresh failure
   */
  logTokenRefreshFailure(userId: string, reason: string): void {
    this.log({
      type: SecurityEventType.TOKEN_REFRESH_FAILURE,
      severity: SecurityEventSeverity.ERROR,
      userId,
      action: 'Token refresh failed',
      metadata: { reason },
    });
  }
  
  /**
   * Log permission granted
   */
  logPermissionGranted(
    userId: string,
    grantedBy: string,
    permissions: string[]
  ): void {
    this.log({
      type: SecurityEventType.PERMISSION_GRANTED,
      severity: SecurityEventSeverity.INFO,
      userId,
      action: 'Permissions granted',
      resource: 'permissions',
      metadata: {
        grantedBy,
        permissions,
      },
    });
  }
  
  /**
   * Log permission revoked
   */
  logPermissionRevoked(
    userId: string,
    revokedBy: string,
    permissions: string[]
  ): void {
    this.log({
      type: SecurityEventType.PERMISSION_REVOKED,
      severity: SecurityEventSeverity.WARNING,
      userId,
      action: 'Permissions revoked',
      resource: 'permissions',
      metadata: {
        revokedBy,
        permissions,
      },
    });
  }
  
  /**
   * Log unauthorized access attempt
   */
  logUnauthorizedAccess(
    userId: string,
    resource: string,
    requiredPermission: string
  ): void {
    this.log({
      type: SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      severity: SecurityEventSeverity.WARNING,
      userId,
      action: 'Unauthorized access attempt',
      resource,
      metadata: {
        requiredPermission,
      },
    });
  }
  
  /**
   * Log password change
   */
  logPasswordChanged(userId: string): void {
    this.log({
      type: SecurityEventType.PASSWORD_CHANGED,
      severity: SecurityEventSeverity.INFO,
      userId,
      action: 'Password changed successfully',
    });
  }
  
  /**
   * Log CSRF token mismatch
   */
  logCSRFMismatch(userId?: string): void {
    this.log({
      type: SecurityEventType.CSRF_TOKEN_MISMATCH,
      severity: SecurityEventSeverity.ERROR,
      userId,
      action: 'CSRF token mismatch detected',
    });
  }
  
  /**
   * Log rate limit exceeded
   */
  logRateLimitExceeded(userId: string, endpoint: string): void {
    this.log({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecurityEventSeverity.WARNING,
      userId,
      action: 'Rate limit exceeded',
      resource: endpoint,
    });
  }
  
  /**
   * Check if event should be logged based on severity
   */
  private shouldLog(severity: SecurityEventSeverity): boolean {
    const severityOrder = [
      SecurityEventSeverity.INFO,
      SecurityEventSeverity.WARNING,
      SecurityEventSeverity.ERROR,
      SecurityEventSeverity.CRITICAL,
    ];
    
    const eventLevel = severityOrder.indexOf(severity);
    const minLevel = severityOrder.indexOf(this.config.minSeverity);
    
    return eventLevel >= minLevel;
  }
  
  /**
   * Sanitize event data for production
   */
  private sanitizeEvent(event: SecurityEvent): SecurityEvent {
    if (this.config.includeSensitiveData) {
      return event;
    }
    
    // Remove sensitive data in production
    const sanitized = { ...event };
    
    // Remove IP address in production
    delete sanitized.ipAddress;
    
    // Mask email partially
    if (sanitized.userEmail) {
      sanitized.userEmail = this.maskEmail(sanitized.userEmail);
    }
    
    return sanitized;
  }
  
  /**
   * Mask email address for privacy
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedLocal = local.length > 2
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    
    return `${maskedLocal}@${domain}`;
  }
  
  /**
   * Log event to console
   */
  private logToConsole(event: SecurityEvent): void {
    const prefix = `[SECURITY ${event.severity}]`;
    const message = `${prefix} ${event.type}: ${event.action}`;
    
    switch (event.severity) {
      case SecurityEventSeverity.INFO:
        console.info(message, event);
        break;
      case SecurityEventSeverity.WARNING:
        console.warn(message, event);
        break;
      case SecurityEventSeverity.ERROR:
      case SecurityEventSeverity.CRITICAL:
        console.error(message, event);
        break;
    }
  }
  
  /**
   * Start flush interval for remote logging
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 10000); // Flush every 10 seconds
  }
  
  /**
   * Flush queued events to remote endpoint
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        });
      }
    } catch (error) {
      console.error('Failed to send security events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }
  
  /**
   * Get client IP address (if available)
   */
  private getClientIP(): string | undefined {
    // In browser, IP is not directly accessible
    // This would be set by server-side rendering or proxy
    return undefined;
  }
  
  /**
   * Get user agent
   */
  private getUserAgent(): string | undefined {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return undefined;
  }
  
  /**
   * Stop logger and flush remaining events
   */
  async stop(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    await this.flushEvents();
  }
}

/**
 * Singleton instance of Security Logger
 */
export const securityLogger = new SecurityLogger();

/**
 * Initialize security logging
 * Should be called on application startup
 */
export function initializeSecurityLogging(config?: Partial<SecurityLoggerConfig>): void {
  if (config) {
    // Create new instance with custom config
    Object.assign(securityLogger, new SecurityLogger(config));
  }
}
