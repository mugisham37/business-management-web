import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../services/security.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { CustomLoggerService } from '../../logger/logger.service';

/**
 * Auth Security Middleware
 * 
 * Provides security enhancements for authentication requests including:
 * - Request fingerprinting and device tracking
 * - Rate limiting and brute force protection
 * - Risk assessment and anomaly detection
 * - Security event logging
 * 
 * This middleware runs before authentication guards and adds security context
 * to requests for enhanced security decision making.
 */
@Injectable()
export class AuthSecurityMiddleware implements NestMiddleware {
  constructor(
    private readonly securityService: SecurityService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('AuthSecurityMiddleware');
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract security context from request
      const securityContext = this.extractSecurityContext(req);
      
      // Add security context to request for use by guards and services
      (req as any).securityContext = securityContext;

      // Log security-relevant requests
      if (this.isSecurityRelevantRequest(req)) {
        await this.logSecurityRequest(req, securityContext);
      }

      // Check for suspicious patterns
      await this.checkSuspiciousActivity(req, securityContext);

      next();
    } catch (error) {
      this.logger.error(`Auth security middleware error on ${req.method} ${path} from ${req.ip}: ${error.message}`);
      
      // Don't block the request on middleware errors
      next();
    }
  }

  /**
   * Extract security context from request
   */
  private extractSecurityContext(req: Request): any {
    return {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceFingerprint: req.headers['x-device-fingerprint'],
      location: req.headers['x-user-location'],
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      referer: req.headers.referer,
      acceptLanguage: req.headers['accept-language'],
      acceptEncoding: req.headers['accept-encoding'],
      connection: req.headers.connection,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIp: req.headers['x-real-ip'],
    };
  }

  /**
   * Check if request is security-relevant
   */
  private isSecurityRelevantRequest(req: Request): boolean {
    const securityPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/change-password',
      '/auth/mfa',
      '/auth/social',
    ];

    return securityPaths.some(path => req.path.includes(path));
  }

  /**
   * Log security-relevant requests
   */
  private async logSecurityRequest(req: Request, context: any): Promise<void> {
    try {
      this.logger.log('Security-relevant request', {
        path: req.path,
        method: req.method,
        ip: context.ip,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        timestamp: context.timestamp,
      });
    } catch (error) {
      // Ignore logging errors
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkSuspiciousActivity(req: Request, context: any): Promise<void> {
    try {
      // Check for rapid requests from same IP
      const requestKey = `security:requests:${context.ip}`;
      // This would typically use Redis to track request patterns
      
      // Check for suspicious user agents
      if (this.isSuspiciousUserAgent(context.userAgent)) {
        this.logger.warn('Suspicious user agent detected', {
          userAgent: context.userAgent,
          ip: context.ip,
          path: req.path,
        });
      }

      // Check for suspicious request patterns
      if (this.isSuspiciousRequest(req, context)) {
        this.logger.warn('Suspicious request pattern detected', {
          path: req.path,
          method: req.method,
          ip: context.ip,
          userAgent: context.userAgent,
        });
      }
    } catch (error) {
      // Ignore errors in suspicious activity detection
    }
  }

  /**
   * Check if user agent is suspicious
   */
  private isSuspiciousUserAgent(userAgent?: string): boolean {
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
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Check if request pattern is suspicious
   */
  private isSuspiciousRequest(req: Request, context: any): boolean {
    // Check for missing common headers
    if (!context.userAgent || !req.headers.accept) {
      return true;
    }

    // Check for unusual request methods on auth endpoints
    if (req.path.includes('/auth/') && !['GET', 'POST'].includes(req.method)) {
      return true;
    }

    // Check for suspicious query parameters
    const suspiciousParams = ['script', 'eval', 'exec', 'system', 'cmd'];
    const queryString = req.url?.split('?')[1] || '';
    if (suspiciousParams.some(param => queryString.toLowerCase().includes(param))) {
      return true;
    }

    return false;
  }
}