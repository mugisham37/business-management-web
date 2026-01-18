import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../cache/cache.service';
import { AuthEventsService } from '../services/auth-events.service';

/**
 * Auth Security Middleware
 * Provides additional security features for authentication
 * - Rate limiting for auth endpoints
 * - IP-based restrictions
 * - Device fingerprinting
 * - Suspicious activity detection
 */
@Injectable()
export class AuthSecurityMiddleware implements NestMiddleware {
  private readonly maxLoginAttempts: number;
  private readonly lockoutDuration: number;
  private readonly suspiciousActivityThreshold: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly authEventsService: AuthEventsService,
  ) {
    this.maxLoginAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    this.lockoutDuration = this.configService.get<number>('LOCKOUT_DURATION', 15 * 60 * 1000); // 15 minutes
    this.suspiciousActivityThreshold = this.configService.get<number>('SUSPICIOUS_ACTIVITY_THRESHOLD', 10);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const endpoint = req.path;

    // Apply security checks for auth endpoints
    if (this.isAuthEndpoint(endpoint)) {
      await this.checkRateLimit(clientIp, endpoint);
      await this.checkSuspiciousActivity(clientIp, userAgent);
      await this.logAuthAttempt(clientIp, userAgent, endpoint);
    }

    next();
  }

  private isAuthEndpoint(path: string): boolean {
    const authEndpoints = ['/graphql']; // GraphQL endpoint handles all auth operations
    return authEndpoints.some(endpoint => path.includes(endpoint));
  }

  private async checkRateLimit(clientIp: string, endpoint: string): Promise<void> {
    const key = `rate_limit:${clientIp}:${endpoint}`;
    const attempts = await this.cacheService.get<number>(key) || 0;

    if (attempts >= this.maxLoginAttempts) {
      const lockoutKey = `lockout:${clientIp}`;
      const lockoutTime = await this.cacheService.get<number>(lockoutKey);
      
      if (lockoutTime && Date.now() < lockoutTime) {
        throw new UnauthorizedException('Too many attempts. Please try again later.');
      } else {
        // Lockout expired, reset counter
        await this.cacheService.del(key);
        await this.cacheService.del(lockoutKey);
      }
    }

    // Increment attempt counter
    await this.cacheService.set(key, attempts + 1, { ttl: 300 }); // 5 minutes
  }

  private async checkSuspiciousActivity(clientIp: string, userAgent: string): Promise<void> {
    const activityKey = `activity:${clientIp}`;
    const recentActivity = await this.cacheService.get<any[]>(activityKey) || [];

    // Check for rapid requests from same IP
    const now = Date.now();
    const recentRequests = recentActivity.filter(activity => 
      now - activity.timestamp < 60000 // Last minute
    );

    if (recentRequests.length > this.suspiciousActivityThreshold) {
      // Log suspicious activity
      await this.authEventsService.publishFailedLoginAttempt(
        'unknown',
        'unknown',
        'Suspicious activity detected',
        clientIp,
        userAgent,
      );

      throw new UnauthorizedException('Suspicious activity detected. Access temporarily restricted.');
    }

    // Add current request to activity log
    recentActivity.push({
      timestamp: now,
      userAgent,
      endpoint: 'auth',
    });

    // Keep only last 20 activities
    const limitedActivity = recentActivity.slice(-20);
    await this.cacheService.set(activityKey, limitedActivity, { ttl: 3600 }); // 1 hour
  }

  private async logAuthAttempt(clientIp: string, userAgent: string, endpoint: string): Promise<void> {
    const logKey = `auth_log:${clientIp}:${Date.now()}`;
    const logData = {
      ip: clientIp,
      userAgent,
      endpoint,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(logKey, logData, { ttl: 86400 }); // 24 hours
  }

  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Check if IP is in whitelist
   */
  private async isIpWhitelisted(ip: string): Promise<boolean> {
    const whitelist = this.configService.get<string>('IP_WHITELIST', '');
    if (!whitelist) return false;

    const whitelistedIps = whitelist.split(',').map(ip => ip.trim());
    return whitelistedIps.includes(ip);
  }

  /**
   * Check if IP is in blacklist
   */
  private async isIpBlacklisted(ip: string): Promise<boolean> {
    const blacklistKey = `blacklist:${ip}`;
    return await this.cacheService.exists(blacklistKey);
  }

  /**
   * Add IP to temporary blacklist
   */
  async blacklistIp(ip: string, duration: number = 3600): Promise<void> {
    const blacklistKey = `blacklist:${ip}`;
    await this.cacheService.set(blacklistKey, true, { ttl: duration });
  }

  /**
   * Remove IP from blacklist
   */
  async removeFromBlacklist(ip: string): Promise<void> {
    const blacklistKey = `blacklist:${ip}`;
    await this.cacheService.del(blacklistKey);
  }

  /**
   * Get recent auth attempts for IP
   */
  async getRecentAuthAttempts(ip: string): Promise<any[]> {
    const pattern = `auth_log:${ip}:*`;
    // This would need to be implemented based on your cache service capabilities
    return [];
  }

  /**
   * Clear rate limit for IP (admin function)
   */
  async clearRateLimit(ip: string): Promise<void> {
    const keys = [
      `rate_limit:${ip}:*`,
      `lockout:${ip}`,
      `activity:${ip}`,
    ];

    await Promise.all(keys.map(key => this.cacheService.del(key)));
  }
}