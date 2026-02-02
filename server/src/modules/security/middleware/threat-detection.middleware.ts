import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ThreatDetectionService } from '../services/threat-detection.service';

/**
 * 🚨 THREAT DETECTION MIDDLEWARE
 * 
 * HTTP-level threat detection and IP filtering.
 * Runs before request processing to block known threats.
 */
@Injectable()
export class ThreatDetectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ThreatDetectionMiddleware.name);

  constructor(private readonly threatDetectionService: ThreatDetectionService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      
      if (clientIp) {
        const isBlacklisted = await this.threatDetectionService.isIpBlacklisted(clientIp);
        
        if (isBlacklisted) {
          this.logger.warn(`Blocked request from blacklisted IP: ${clientIp}`);
          res.status(403).json({
            error: 'Access denied',
            message: 'Your IP address has been blocked due to security concerns',
          });
          return;
        }
      }
    } catch (error) {
      this.logger.error('Threat detection middleware error', error);
      // Continue processing even if threat detection fails
    }

    next();
  }

  private getClientIp(req: Request): string | undefined {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
           req.headers['x-real-ip']?.toString();
  }
}