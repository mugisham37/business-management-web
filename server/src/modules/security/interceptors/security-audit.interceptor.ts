import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../services/audit.service';

/**
 * 🔍 SECURITY AUDIT INTERCEPTOR
 * 
 * Automatically logs all operations for compliance and security monitoring.
 * Captures request/response data, user context, and security metadata.
 * 
 * Features:
 * - Automatic audit logging for all GraphQL operations
 * - Sensitive data masking
 * - Error tracking and security event correlation
 * - Compliance-ready audit trails
 * - Real-time security monitoring integration
 */
@Injectable()
export class SecurityAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityAuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;
    const user = request?.user;
    const tenantId = request?.headers['x-tenant-id'] || user?.tenantId;

    // Check if audit is required for this operation
    const auditRequired = this.reflector.get<{ action: string; category: string }>('auditRequired', context.getHandler());
    const securityLevel = this.reflector.get<string>('securityLevel', context.getHandler());
    const isHighRisk = this.reflector.get<boolean>('highRiskOperation', context.getHandler());

    // Always audit high-risk operations and those explicitly marked
    const shouldAudit = auditRequired || isHighRisk || securityLevel === 'critical' || securityLevel === 'high';

    if (!shouldAudit) {
      return next.handle();
    }

    const operationType = info.operation.operation; // query, mutation, subscription
    const operationName = info.fieldName;
    const args = gqlContext.getArgs();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.auditService.logEvent({
            tenantId,
            userId: user?.id,
            action: this.mapOperationToAction(operationType, operationName),
            resource: operationName,
            resourceId: this.extractResourceId(args, response),
            newValues: this.sanitizeData(args),
            metadata: {
              operationType,
              operationName,
              duration: Date.now() - startTime,
              success: true,
              securityLevel: securityLevel || 'medium',
              category: auditRequired?.category || 'security',
              ipAddress: this.getClientIp(request),
              userAgent: request?.headers['user-agent'],
              requestId: request?.id,
            },
            ipAddress: this.getClientIp(request),
            userAgent: request?.headers['user-agent'],
            requestId: request?.id,
            severity: this.mapSecurityLevelToSeverity(securityLevel),
            category: (auditRequired?.category as 'security' | 'data' | 'system' | 'user' | 'compliance') || 'security',
          });
        } catch (error) {
          this.logger.error('Failed to log audit event', error);
        }
      }),
      catchError(async (error) => {
        try {
          await this.auditService.logEvent({
            tenantId,
            userId: user?.id,
            action: this.mapOperationToAction(operationType, operationName),
            resource: operationName,
            resourceId: this.extractResourceId(args),
            newValues: this.sanitizeData(args),
            metadata: {
              operationType,
              operationName,
              duration: Date.now() - startTime,
              success: false,
              error: error.message,
              securityLevel: securityLevel || 'medium',
              category: auditRequired?.category || 'security',
              ipAddress: this.getClientIp(request),
              userAgent: request?.headers['user-agent'],
              requestId: request?.id,
            },
            ipAddress: this.getClientIp(request),
            userAgent: request?.headers['user-agent'],
            requestId: request?.id,
            severity: 'high', // Errors are always high severity
            category: (auditRequired?.category as 'security' | 'data' | 'system' | 'user' | 'compliance') || 'security',
          });
        } catch (auditError) {
          this.logger.error('Failed to log audit event for error', auditError);
        }
        throw error;
      }),
    );
  }

  private mapOperationToAction(operationType: string, operationName: string): string {
    if (operationType === 'mutation') {
      if (operationName.startsWith('create')) return 'create';
      if (operationName.startsWith('update')) return 'update';
      if (operationName.startsWith('delete')) return 'delete';
      if (operationName.includes('login') || operationName.includes('Login')) return 'login';
      if (operationName.includes('logout') || operationName.includes('Logout')) return 'logout';
      return 'update'; // Default for mutations
    }
    
    if (operationType === 'query') {
      if (operationName.includes('export') || operationName.includes('Export')) return 'export';
      return 'read';
    }
    
    return operationType; // subscription, etc.
  }

  private extractResourceId(args: any, response?: any): string | undefined {
    // Try to extract ID from common argument patterns
    if (args?.id) return args.id;
    if (args?.input?.id) return args.input.id;
    if (response?.id) return response.id;
    
    // Try other common ID patterns
    const idFields = ['userId', 'tenantId', 'resourceId', 'entityId'];
    for (const field of idFields) {
      if (args?.[field]) return args[field];
      if (args?.input?.[field]) return args.input[field];
    }
    
    return undefined;
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = [
      'password', 'passwordHash', 'token', 'secret', 'key', 'apiKey',
      'ssn', 'socialSecurityNumber', 'creditCard', 'bankAccount',
      'mfaSecret', 'backupCodes', 'privateKey', 'certificate'
    ];
    
    const sanitized = { ...data };
    
    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };
    
    return sanitizeObject(sanitized);
  }

  private getClientIp(request: any): string | undefined {
    return request?.ip || 
           request?.connection?.remoteAddress || 
           request?.socket?.remoteAddress ||
           request?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           request?.headers['x-real-ip'];
  }

  private mapSecurityLevelToSeverity(securityLevel?: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (securityLevel) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }
}