import { SetMetadata, applyDecorators, UseInterceptors } from '@nestjs/common';
import { SecurityAuditInterceptor } from '../interceptors/security-audit.interceptor';
import { ThreatDetectionInterceptor } from '../interceptors/threat-detection.interceptor';

/**
 * 🎯 SIMPLIFIED SECURITY DECORATORS
 * 
 * Easy-to-use decorators that apply comprehensive security to any resolver or controller.
 * These decorators combine multiple security features with sensible defaults.
 */

/**
 * Apply comprehensive security to an operation
 * Includes: audit logging, threat detection, compliance checking
 */
export const SecureOperation = (options?: {
  level?: 'low' | 'medium' | 'high' | 'critical';
  auditCategory?: string;
  requireCompliance?: boolean;
  detectThreats?: boolean;
}) => {
  const level = options?.level || 'medium';
  const auditCategory = options?.auditCategory || 'security';
  const requireCompliance = options?.requireCompliance !== false;
  const detectThreats = options?.detectThreats !== false;

  const decorators = [
    SetMetadata('securityLevel', level),
    SetMetadata('auditRequired', { action: 'secure_operation', category: auditCategory }),
    UseInterceptors(SecurityAuditInterceptor),
  ];

  if (detectThreats) {
    decorators.push(
      SetMetadata('threatAnalysis', true),
      SetMetadata('threatSeverity', level),
      UseInterceptors(ThreatDetectionInterceptor),
    );
  }

  if (requireCompliance) {
    decorators.push(SetMetadata('complianceCheck', true));
  }

  return applyDecorators(...decorators);
};

/**
 * Mark operation as high-risk with maximum security
 */
export const HighRiskOperation = (auditCategory: string = 'security') => {
  return applyDecorators(
    SetMetadata('securityLevel', 'critical'),
    SetMetadata('highRiskOperation', true),
    SetMetadata('auditRequired', { action: 'high_risk_operation', category: auditCategory }),
    SetMetadata('threatAnalysis', true),
    SetMetadata('threatSeverity', 'critical'),
    SetMetadata('complianceCheck', true),
    SetMetadata('requiresMFA', true),
    UseInterceptors(SecurityAuditInterceptor, ThreatDetectionInterceptor),
  );
};

/**
 * Apply data protection security for sensitive data operations
 */
export const DataProtection = (classification: 'public' | 'internal' | 'confidential' | 'restricted' = 'confidential') => {
  return applyDecorators(
    SetMetadata('dataClassification', classification),
    SetMetadata('encryptionRequired', true),
    SetMetadata('auditRequired', { action: 'data_access', category: 'data' }),
    SetMetadata('securityLevel', classification === 'restricted' ? 'critical' : 'high'),
    UseInterceptors(SecurityAuditInterceptor),
  );
};

/**
 * Apply compliance-focused security
 */
export const ComplianceRequired = (frameworks: string[] = ['GDPR', 'SOC2']) => {
  return applyDecorators(
    SetMetadata('complianceCheck', true),
    SetMetadata('complianceFrameworks', frameworks),
    SetMetadata('auditRequired', { action: 'compliance_operation', category: 'compliance' }),
    SetMetadata('securityLevel', 'high'),
    UseInterceptors(SecurityAuditInterceptor),
  );
};

/**
 * Apply threat monitoring to an operation
 */
export const ThreatMonitoring = (severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  return applyDecorators(
    SetMetadata('threatAnalysis', true),
    SetMetadata('threatSeverity', severity),
    SetMetadata('auditRequired', { action: 'monitored_operation', category: 'security' }),
    UseInterceptors(SecurityAuditInterceptor, ThreatDetectionInterceptor),
  );
};

/**
 * Apply audit logging with specific category
 */
export const AuditLog = (category: string = 'user', action?: string) => {
  return applyDecorators(
    SetMetadata('auditRequired', { action: action || 'operation', category }),
    UseInterceptors(SecurityAuditInterceptor),
  );
};

/**
 * Apply encryption requirements
 */
export const RequireEncryption = (strict: boolean = true) => {
  return applyDecorators(
    SetMetadata('encryptionRequired', true),
    SetMetadata('strictEncryption', strict),
    SetMetadata('auditRequired', { action: 'encrypted_operation', category: 'security' }),
  );
};

/**
 * Apply rate limiting for security
 */
export const SecurityRateLimit = (requests: number = 100, windowMs: number = 60000) => {
  return applyDecorators(
    SetMetadata('rateLimitSecurity', true),
    SetMetadata('rateLimitConfig', { requestsPerMinute: requests, windowMs }),
    SetMetadata('auditRequired', { action: 'rate_limited_operation', category: 'security' }),
  );
};

/**
 * Apply geo-fencing restrictions
 */
export const GeoRestricted = (allowedRegions: string[]) => {
  return applyDecorators(
    SetMetadata('geoFence', { enabled: true, allowedRegions }),
    SetMetadata('auditRequired', { action: 'geo_restricted_operation', category: 'security' }),
    UseInterceptors(SecurityAuditInterceptor),
  );
};

/**
 * Require additional verification
 */
export const RequireVerification = (method: 'email' | 'sms' | 'totp' | 'all' = 'totp') => {
  return applyDecorators(
    SetMetadata('enhancedVerification', { enabled: true, method }),
    SetMetadata('auditRequired', { action: 'verified_operation', category: 'security' }),
    UseInterceptors(SecurityAuditInterceptor),
  );
};

/**
 * Apply tenant isolation enforcement
 */
export const TenantIsolated = () => {
  return applyDecorators(
    SetMetadata('enforceTenantIsolation', true),
    SetMetadata('auditRequired', { action: 'tenant_operation', category: 'security' }),
    UseInterceptors(SecurityAuditInterceptor),
  );
};