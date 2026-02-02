import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { ThreatDetectionService } from '../services/threat-detection.service';
import { SecurityMonitoringService } from '../services/security-monitoring.service';

/**
 * 🚨 THREAT DETECTION INTERCEPTOR
 * 
 * Real-time threat analysis and behavioral monitoring for all operations.
 * Automatically detects and responds to security threats and anomalies.
 * 
 * Features:
 * - Real-time threat pattern matching
 * - Behavioral anomaly detection
 * - Account compromise detection
 * - Automatic threat response
 * - Security event correlation
 * - Risk-based access control
 */
@Injectable()
export class ThreatDetectionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ThreatDetectionInterceptor.name);

  constructor(
    private readonly threatDetectionService: ThreatDetectionService,
    private readonly securityMonitoringService: SecurityMonitoringService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;
    const user = request?.user;
    const tenantId = request?.headers['x-tenant-id'] || user?.tenantId;

    // Check if threat analysis is enabled for this operation
    const threatAnalysis = this.reflector.get<boolean>('threatAnalysis', context.getHandler());
    const threatSeverity = this.reflector.get<string>('threatSeverity', context.getHandler());
    const isHighRisk = this.reflector.get<boolean>('highRiskOperation', context.getHandler());

    if (!threatAnalysis && !isHighRisk) {
      return next.handle();
    }

    const operationName = info.fieldName;
    const args = gqlContext.getArgs();
    const clientIp = this.getClientIp(request);

    try {
      // Create security event for analysis
      const securityEvent = {
        tenantId,
        userId: user?.id,
        action: operationName,
        resource: operationName,
        resourceId: this.extractResourceId(args),
        ipAddress: clientIp,
        userAgent: request?.headers['user-agent'],
        timestamp: new Date(),
        metadata: {
          operationType: info.operation.operation,
          args: this.sanitizeArgs(args),
          severity: threatSeverity || 'medium',
          riskLevel: isHighRisk ? 'high' : 'medium',
        },
      };

      // Perform threat analysis
      const threatAnalyses = await this.threatDetectionService.analyzeEvent(securityEvent);

      // Check for high-severity threats
      const criticalThreats = threatAnalyses.filter(
        analysis => analysis.confidence >= 80 && analysis.riskScore >= 70
      );

      if (criticalThreats.length > 0) {
        // Log security event
        await this.securityMonitoringService.logSecurityEvent({
          tenantId,
          type: 'THREAT_DETECTED',
          description: `Critical threat detected: ${criticalThreats.map(t => t.threatId).join(', ')}`,
          severity: 'critical',
          userId: user?.id,
          resource: operationName,
          resourceId: this.extractResourceId(args),
          ipAddress: clientIp,
          metadata: {
            threats: criticalThreats,
            operation: operationName,
            confidence: Math.max(...criticalThreats.map(t => t.confidence)),
            riskScore: Math.max(...criticalThreats.map(t => t.riskScore)),
          },
        });

        // Block the operation if threat is severe enough
        const maxRiskScore = Math.max(...criticalThreats.map(t => t.riskScore));
        if (maxRiskScore >= 90) {
          this.logger.warn(`Blocking operation ${operationName} due to critical threat (risk score: ${maxRiskScore})`);
          throw new ForbiddenException('Operation blocked due to security threat detection');
        }
      }

      // Perform behavioral analysis for authenticated users
      if (user?.id && tenantId) {
        try {
          const behavioralAnomalies = await this.threatDetectionService.performBehavioralAnalysis(
            user.id,
            tenantId
          );

          const highRiskAnomalies = behavioralAnomalies.filter(
            anomaly => anomaly.confidence >= 70
          );

          if (highRiskAnomalies.length > 0) {
            await this.securityMonitoringService.logSecurityEvent({
              tenantId,
              type: 'BEHAVIORAL_ANOMALY',
              description: `Behavioral anomalies detected for user ${user.id}`,
              severity: 'high',
              userId: user.id,
              resource: 'user_behavior',
              resourceId: user.id,
              ipAddress: clientIp,
              metadata: {
                anomalies: highRiskAnomalies,
                operation: operationName,
              },
            });
          }
        } catch (error) {
          this.logger.error('Failed to perform behavioral analysis', error);
        }
      }

      // Check for account compromise
      if (user?.id && tenantId && (isHighRisk || threatSeverity === 'critical')) {
        try {
          const isCompromised = await this.threatDetectionService.isAccountCompromised(
            tenantId,
            user.id
          );

          if (isCompromised) {
            await this.securityMonitoringService.logSecurityEvent({
              tenantId,
              type: 'ACCOUNT_COMPROMISE',
              description: `Potential account compromise detected for user ${user.id}`,
              severity: 'critical',
              userId: user.id,
              resource: 'user_account',
              resourceId: user.id,
              ipAddress: clientIp,
              metadata: {
                operation: operationName,
                indicators: ['multiple_failed_logins', 'unusual_access_patterns'],
              },
            });

            this.logger.warn(`Potential account compromise detected for user ${user.id}`);
            // Note: We don't block here as it might be a false positive
            // Instead, we log and alert for manual review
          }
        } catch (error) {
          this.logger.error('Failed to check account compromise', error);
        }
      }

    } catch (error) {
      this.logger.error('Threat detection analysis failed', error);
      // Don't block the operation if threat detection fails
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Log successful operation completion for pattern analysis
        if (threatAnalysis || isHighRisk) {
          try {
            await this.securityMonitoringService.logSecurityEvent({
              tenantId,
              type: 'OPERATION_COMPLETED',
              description: `${operationName} completed successfully`,
              severity: 'low',
              userId: user?.id,
              resource: operationName,
              resourceId: this.extractResourceId(args, response),
              ipAddress: clientIp,
              metadata: {
                operation: operationName,
                success: true,
                responseSize: JSON.stringify(response).length,
              },
            });
          } catch (error) {
            this.logger.error('Failed to log operation completion', error);
          }
        }
      })
    );
  }

  private extractResourceId(args: any, response?: any): string | undefined {
    if (args?.id) return args.id;
    if (args?.input?.id) return args.input.id;
    if (response?.id) return response.id;
    
    const idFields = ['userId', 'tenantId', 'resourceId', 'entityId'];
    for (const field of idFields) {
      if (args?.[field]) return args[field];
      if (args?.input?.[field]) return args.input[field];
    }
    
    return undefined;
  }

  private sanitizeArgs(args: any): any {
    if (!args || typeof args !== 'object') return args;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...args };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      if (sanitized.input?.[field]) {
        sanitized.input[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private getClientIp(request: any): string | undefined {
    return request?.ip || 
           request?.connection?.remoteAddress || 
           request?.socket?.remoteAddress ||
           request?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           request?.headers['x-real-ip'];
  }
}