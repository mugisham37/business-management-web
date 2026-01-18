import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Auth Utilities
 * Common utility functions for authentication and authorization
 */
export class AuthUtils {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string, rounds: number = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate random numeric code
   */
  static generateNumericCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Generate backup codes for MFA
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain special characters');
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('Password is too common');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}:${ip}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check if user has permission (with wildcard support)
   */
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Direct match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check wildcards
    for (const permission of userPermissions) {
      if (this.matchesWildcard(permission, requiredPermission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match wildcard permissions
   */
  private static matchesWildcard(wildcardPermission: string, specificPermission: string): boolean {
    // Convert wildcard to regex
    const pattern = wildcardPermission
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(specificPermission);
  }

  /**
   * Check if user has any of the required roles
   */
  static hasRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user role is higher than target role
   */
  static isRoleHigherThan(userRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      super_admin: 6,
      tenant_admin: 5,
      manager: 4,
      employee: 3,
      customer: 2,
      readonly: 1,
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

    return userLevel > targetLevel;
  }

  /**
   * Sanitize user data for public consumption
   */
  static sanitizeUser(user: any): Partial<AuthenticatedUser> {
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Generate session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Calculate token expiration time
   */
  static calculateExpirationTime(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);
    
    if (!match) {
      throw new Error('Invalid duration format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid duration unit');
    }
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Validate CSRF token
   */
  static validateCsrfToken(token: string, expectedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'base64'),
      Buffer.from(expectedToken, 'base64')
    );
  }

  /**
   * Generate API key
   */
  static generateApiKey(prefix: string = 'ak'): string {
    const randomPart = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomPart}`;
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    const apiKeyRegex = /^[a-z]{2,}_[a-f0-9]{64}$/;
    return apiKeyRegex.test(apiKey);
  }

  /**
   * Generate JWT claims for user
   */
  static generateJwtClaims(user: any, sessionId: string): any {
    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions || [],
      sessionId,
      iat: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Extract tenant ID from JWT token
   */
  static extractTenantFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.tenantId || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}