import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Auth Utilities
 * 
 * Comprehensive utility functions for authentication and authorization operations.
 * Provides secure implementations for password handling, token generation, 
 * permission validation, and security operations.
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
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ip: string, additionalData?: any): string {
    const data = {
      userAgent,
      ip,
      ...additionalData,
    };
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string, config: any = {}): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
    } = config;

    // Length check
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    } else if (password.length >= minLength) {
      score += 1;
    }

    if (password.length > maxLength) {
      errors.push(`Password must not exceed ${maxLength} characters`);
    }

    // Character requirements
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    }

    // Additional strength checks
    if (password.length >= 12) score += 1;
    if (/[A-Z].*[A-Z]/.test(password)) score += 1; // Multiple uppercase
    if (/\d.*\d/.test(password)) score += 1; // Multiple numbers
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1; // Multiple special chars

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 10), // Cap at 10
    };
  }

  /**
   * Check if permission matches pattern (supports wildcards)
   */
  static matchesPermission(userPermission: string, requiredPermission: string): boolean {
    // Direct match
    if (userPermission === requiredPermission) {
      return true;
    }

    // Wildcard matching
    const userParts = userPermission.split(':');
    const requiredParts = requiredPermission.split(':');

    for (let i = 0; i < Math.max(userParts.length, requiredParts.length); i++) {
      const userPart = userParts[i] || '';
      const requiredPart = requiredParts[i] || '';

      if (userPart === '*') {
        return true; // User has wildcard permission
      }

      if (userPart !== requiredPart && requiredPart !== '*') {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract IP address from request
   */
  static extractIpAddress(req: any): string {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    ).split(',')[0].trim();
  }

  /**
   * Generate session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Sanitize user data for logging
   */
  static sanitizeUserForLogging(user: AuthenticatedUser): any {
    const { passwordHash, mfaSecret, ...sanitized } = user as any;
    return sanitized;
  }

  /**
   * Calculate password entropy
   */
  static calculatePasswordEntropy(password: string): number {
    const charSets = [
      { regex: /[a-z]/, size: 26 },
      { regex: /[A-Z]/, size: 26 },
      { regex: /[0-9]/, size: 10 },
      { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, size: 32 },
    ];

    let charSetSize = 0;
    charSets.forEach(set => {
      if (set.regex.test(password)) {
        charSetSize += set.size;
      }
    });

    return password.length * Math.log2(charSetSize);
  }

  /**
   * Check if email is valid
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Normalize email address
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Verify CSRF token
   */
  static verifyCsrfToken(token: string, expectedToken: string): boolean {
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
   * Hash API key for storage
   */
  static async hashApiKey(apiKey: string): Promise<string> {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandomString(length: number, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const chars = charset || defaultCharset;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      result += chars[randomIndex];
    }
    
    return result;
  }

  /**
   * Time-safe string comparison
   */
  static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Generate JWT key pair
   */
  static generateJwtKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt sensitive data
   */
  static encryptSensitiveData(data: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate OTP secret
   */
  static generateOtpSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[crypto.randomInt(0, chars.length)];
    }
    
    return result;
  }

  /**
   * Format permission for display
   */
  static formatPermissionForDisplay(permission: string): string {
    return permission
      .split(':')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' > ');
  }

  /**
   * Check if user agent is suspicious
   */
  static isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true;

    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /postman/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Generate device trust score
   */
  static calculateDeviceTrustScore(deviceInfo: any): number {
    let score = 50; // Base score

    // Known device
    if (deviceInfo.isKnown) score += 30;
    
    // Consistent location
    if (deviceInfo.consistentLocation) score += 10;
    
    // Recent activity
    if (deviceInfo.recentActivity) score += 10;
    
    // Suspicious patterns
    if (deviceInfo.suspiciousActivity) score -= 40;
    
    // Malware indicators
    if (deviceInfo.malwareIndicators) score -= 50;

    return Math.max(0, Math.min(100, score));
  }
}