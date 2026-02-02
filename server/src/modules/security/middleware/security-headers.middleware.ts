import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

/**
 * 🛡️ SECURITY HEADERS MIDDLEWARE
 * 
 * Applies comprehensive security headers to all HTTP responses.
 * Protects against common web vulnerabilities and attacks.
 * 
 * Security Headers Applied:
 * - Content Security Policy (CSP)
 * - X-Frame-Options (Clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing protection)
 * - X-XSS-Protection (XSS protection)
 * - Strict-Transport-Security (HTTPS enforcement)
 * - Referrer-Policy (Referrer information control)
 * - Permissions-Policy (Feature policy)
 * - X-DNS-Prefetch-Control (DNS prefetching control)
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityHeadersMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Content Security Policy
      const csp = this.configService.get<string>('security.contentSecurityPolicy') || 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' ws: wss:; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'";
      
      res.setHeader('Content-Security-Policy', csp);

      // Prevent clickjacking attacks
      res.setHeader('X-Frame-Options', 'DENY');

      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Enforce HTTPS (only in production)
      if (this.configService.get('app.nodeEnv') === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      // Control referrer information
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Feature policy / Permissions policy
      res.setHeader('Permissions-Policy', 
        'camera=(), ' +
        'microphone=(), ' +
        'geolocation=(), ' +
        'payment=(), ' +
        'usb=(), ' +
        'magnetometer=(), ' +
        'gyroscope=(), ' +
        'accelerometer=()'
      );

      // Control DNS prefetching
      res.setHeader('X-DNS-Prefetch-Control', 'off');

      // Remove server information
      res.removeHeader('X-Powered-By');
      res.setHeader('Server', 'Business Management Platform');

      // Add custom security headers
      res.setHeader('X-Security-Module', 'Enterprise-Security-v2.0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

      // CORS security headers (if not handled by NestJS CORS)
      if (!res.getHeader('Access-Control-Allow-Origin')) {
        const allowedOrigins = this.configService.get<string[]>('app.corsOrigin') || ['http://localhost:3000'];
        const origin = req.headers.origin;
        
        if (origin && allowedOrigins.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-Request-ID');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      }

      // Add request ID for tracing
      if (!req.headers['x-request-id']) {
        const requestId = this.generateRequestId();
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-ID', requestId);
      }

      // Log security headers application (debug level)
      this.logger.debug(`Applied security headers to ${req.method} ${req.url}`);

    } catch (error) {
      this.logger.error('Failed to apply security headers', error);
      // Continue processing even if security headers fail
    }

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}