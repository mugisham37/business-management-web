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
import { ComplianceService } from '../services/compliance.service';
import { AuditService } from '../services/audit.service';

/**
 * 📋 COMPLIANCE INTERCEPTOR
 * 
 * Automatically enforces compliance requirements for operations.
 * Checks compliance frameworks and logs violations.
 * 
 * Features:
 * - Automatic compliance framework checking
 * - GDPR, SOC2, PCI-DSS, HIPAA enforcement
 * - Compliance violation logging
 * - Data classification enforcement
 * - Regulatory requirement validation
 */
@Injectable()
export class ComplianceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ComplianceInterceptor.name);

  constructor(
    private readonly complianceService: ComplianceService,
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;
    const user = request?.user;
    const tenantId = request?.headers['x-tenant-id'] || user?.tenantId;

    // Check if compliance check is required
    const complianceCheck = this.reflector.get<boolean>('complianceCheck', context.getHandler());
    const complianceFrameworks = this.reflector.get<string[]>('complianceFrameworks', context.getHandler());
    const dataClassification = this.reflector.get<string>('dataClassification', context.getHandler());

    if (!complianceCheck && !dataClassification) {
      return next.handle();
    }

    const operationName = info.fieldName;
    const args = gqlContext.getArgs();

    try {
      // Check tenant compliance status
      if (tenantId && complianceCheck) {
        const complianceStatus = await this.complianceService.getComplianceStatus(tenantId);
        
        // Check specific frameworks if specified
        if (complianceFrameworks && complianceFrameworks.length > 0) {
          for (const framework of complianceFrameworks) {
            const frameworkStatus = complianceStatus.frameworks?.find(f => f.frameworkId === framework.toLowerCase());
            
            if (frameworkStatus && frameworkStatus.overallStatus === 'non_compliant') {
              // Log compliance violation
              await this.auditService.logEvent({
                tenantId,
                userId: user?.id,
                action: 'compliance_violation',
                resource: operationName,
                resourceId: this.extractResourceId(args),
                metadata: {
                  framework,
                  operation: operationName,
                  complianceScore: frameworkStatus.complianceScore,
                  violations: frameworkStatus.requirements?.filter(r => r.status === 'non_compliant').length || 0,
                  severity: 'high',
                  category: 'compliance',
                },
                severity: 'high',
                category: 'compliance',
              });

              this.logger.warn(`Compliance violation detected: ${framework} for operation ${operationName}`);
              
              // For critical compliance frameworks, block the operation
              if (framework === 'GDPR' || framework === 'PCI_DSS') {
                throw new ForbiddenException(`Operation blocked due to ${framework} compliance violation`);
              }
            }
          }
        }
      }

      // Check data classification requirements
      if (dataClassification) {
        await this.enforceDataClassification(
          dataClassification,
          operationName,
          tenantId,
          user?.id,
          args
        );
      }

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error('Compliance check failed', error);
      // Don't block operation if compliance check fails (unless it's a critical error)
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Log successful compliance-checked operation
        if (complianceCheck || dataClassification) {
          try {
            await this.auditService.logEvent({
              tenantId,
              userId: user?.id,
              action: 'compliance_checked_operation',
              resource: operationName,
              resourceId: this.extractResourceId(args, response),
              metadata: {
                operation: operationName,
                frameworks: complianceFrameworks,
                dataClassification,
                success: true,
                severity: 'low',
                category: 'compliance',
              },
              severity: 'low',
              category: 'compliance',
            });
          } catch (error) {
            this.logger.error('Failed to log compliance operation', error);
          }
        }
      })
    );
  }

  private async enforceDataClassification(
    classification: string,
    operationName: string,
    tenantId?: string,
    userId?: string,
    args?: any
  ): Promise<void> {
    // Define data classification requirements
    const classificationRequirements = {
      public: { encryptionRequired: false, auditLevel: 'low' },
      internal: { encryptionRequired: false, auditLevel: 'medium' },
      confidential: { encryptionRequired: true, auditLevel: 'high' },
      restricted: { encryptionRequired: true, auditLevel: 'critical' },
    };

    const requirements = classificationRequirements[classification as keyof typeof classificationRequirements];
    
    if (!requirements) {
      this.logger.warn(`Unknown data classification: ${classification}`);
      return;
    }

    // Log data access with appropriate audit level
    if (tenantId) {
      await this.auditService.logEvent({
        tenantId,
        userId,
        action: 'data_classification_access',
        resource: operationName,
        resourceId: this.extractResourceId(args),
        metadata: {
          classification,
          operation: operationName,
          encryptionRequired: requirements.encryptionRequired,
          auditLevel: requirements.auditLevel,
          severity: requirements.auditLevel === 'critical' ? 'critical' : 'medium',
          category: 'data',
        },
        severity: requirements.auditLevel === 'critical' ? 'critical' : 'medium',
        category: 'data',
      });
    }

    // For restricted data, perform additional checks
    if (classification === 'restricted') {
      // Could add additional restrictions here, such as:
      // - Time-based access controls
      // - Location-based restrictions
      // - Additional authentication requirements
      this.logger.log(`Restricted data access logged for operation: ${operationName}`);
    }
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
}