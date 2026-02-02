import { Injectable, Logger } from '@nestjs/common';
import { SecurityOrchestratorService } from '../services/security-orchestrator.service';
import { EncryptionService } from '../services/encryption.service';
import { AuditService } from '../services/audit.service';
import { ThreatDetectionService } from '../services/threat-detection.service';
import { ComplianceService } from '../services/compliance.service';

/**
 * 🎯 SECURITY FACADE
 * 
 * Simplified, high-level interface for consuming security functionality
 * across all modules. Provides the most commonly needed security operations
 * with sensible defaults and automatic best practices.
 * 
 * This facade makes it easy for other modules to:
 * - Encrypt/decrypt sensitive data
 * - Log security events
 * - Perform threat analysis
 * - Check compliance requirements
 * - Audit user actions
 * 
 * Usage Examples:
 * ```typescript
 * // In any module
 * constructor(private readonly security: SecurityFacade) {}
 * 
 * // Encrypt sensitive data
 * const encrypted = await this.security.encrypt(sensitiveData, tenantId);
 * 
 * // Log security event
 * await this.security.logSecurityEvent('user_login', { userId, tenantId });
 * 
 * // Check if user is compromised
 * const isCompromised = await this.security.isUserCompromised(userId, tenantId);
 * ```
 */
@Injectable()
export class SecurityFacade {
  private readonly logger = new Logger(SecurityFacade.name);

  constructor(
    private readonly orchestrator: SecurityOrchestratorService,
    private readonly encryption: EncryptionService,
    private readonly audit: AuditService,
    private readonly threatDetection: ThreatDetectionService,
    private readonly compliance: ComplianceService,
  ) {}

  // ============================================================================
  // 🔐 ENCRYPTION OPERATIONS
  // ============================================================================

  /**
   * Encrypt sensitive data with tenant-specific key
   */
  async encrypt(data: string, tenantId: string, fieldName: string = 'default'): Promise<string> {
    try {
      return await this.encryption.encryptField(data, tenantId, fieldName);
    } catch (error) {
      this.logger.error(`Encryption failed for tenant ${tenantId}`, error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive data with tenant-specific key
   */
  async decrypt(encryptedData: string, tenantId: string, fieldName: string = 'default'): Promise<string> {
    try {
      return await this.encryption.decryptField(encryptedData, tenantId, fieldName);
    } catch (error) {
      this.logger.error(`Decryption failed for tenant ${tenantId}`, error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Hash password securely
   */
  async hashPassword(password: string): Promise<string> {
    return await this.encryption.hashPassword(password);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await this.encryption.verifyPassword(password, hash);
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: any, fieldsToMask?: string[]): any {
    return this.encryption.maskSensitiveData(data, fieldsToMask);
  }

  // ============================================================================
  // 📝 AUDIT & LOGGING OPERATIONS
  // ============================================================================

  /**
   * Log security event with automatic context
   */
  async logSecurityEvent(
    action: string,
    context: {
      tenantId?: string;
      userId?: string;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      await this.audit.logEvent({
        tenantId: context.tenantId,
        userId: context.userId,
        action,
        resource: context.resource || 'unknown',
        resourceId: context.resourceId,
        metadata: {
          ...context.metadata,
          severity: 'medium',
          category: 'security',
          timestamp: new Date(),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'medium',
        category: 'security',
      });
    } catch (error) {
      this.logger.error(`Failed to log security event: ${action}`, error);
      // Don't throw - logging failures shouldn't break business logic
    }
  }

  /**
   * Log user action for audit trail
   */
  async logUserAction(
    userId: string,
    tenantId: string,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.audit.logEvent({
        tenantId,
        userId,
        action,
        resource,
        resourceId,
        oldValues: oldValues ? this.maskSensitiveData(oldValues) : undefined,
        newValues: newValues ? this.maskSensitiveData(newValues) : undefined,
        metadata: {
          ...metadata,
          severity: 'low',
          category: 'user',
        },
        severity: 'low',
        category: 'user',
      });
    } catch (error) {
      this.logger.error(`Failed to log user action: ${action}`, error);
    }
  }

  // ============================================================================
  // 🚨 THREAT DETECTION OPERATIONS
  // ============================================================================

  /**
   * Check if user account is compromised
   */
  async isUserCompromised(userId: string, tenantId: string): Promise<boolean> {
    try {
      return await this.threatDetection.isAccountCompromised(tenantId, userId);
    } catch (error) {
      this.logger.error(`Failed to check account compromise for user ${userId}`, error);
      return false; // Fail safe - don't block user if check fails
    }
  }

  /**
   * Perform behavioral analysis on user
   */
  async analyzeBehavior(userId: string, tenantId: string): Promise<any[]> {
    try {
      return await this.orchestrator.performBehavioralAnalysis(userId, tenantId);
    } catch (error) {
      this.logger.error(`Failed to analyze behavior for user ${userId}`, error);
      return [];
    }
  }

  /**
   * Check if IP address is blacklisted
   */
  async isIpBlacklisted(ipAddress: string): Promise<boolean> {
    try {
      return await this.threatDetection.isIpBlacklisted(ipAddress);
    } catch (error) {
      this.logger.error(`Failed to check IP blacklist for ${ipAddress}`, error);
      return false;
    }
  }

  // ============================================================================
  // 📋 COMPLIANCE OPERATIONS
  // ============================================================================

  /**
   * Check compliance status for tenant
   */
  async getComplianceStatus(tenantId: string): Promise<any> {
    try {
      return await this.compliance.getComplianceStatus(tenantId);
    } catch (error) {
      this.logger.error(`Failed to get compliance status for tenant ${tenantId}`, error);
      return { status: 'unknown', frameworks: [] };
    }
  }

  /**
   * Generate GDPR data export
   */
  async exportUserData(tenantId: string, userId: string): Promise<any> {
    try {
      return await this.compliance.generateGdprDataExport(tenantId, userId);
    } catch (error) {
      this.logger.error(`Failed to export user data for ${userId}`, error);
      throw new Error('Data export failed');
    }
  }

  /**
   * Process GDPR deletion request
   */
  async deleteUserData(tenantId: string, userId: string): Promise<void> {
    try {
      await this.compliance.processGdprDeletionRequest(tenantId, userId);
      await this.logSecurityEvent('gdpr_deletion_processed', {
        tenantId,
        userId,
        resource: 'user_data',
        resourceId: userId,
        metadata: { reason: 'gdpr_request' },
      });
    } catch (error) {
      this.logger.error(`Failed to delete user data for ${userId}`, error);
      throw new Error('Data deletion failed');
    }
  }

  // ============================================================================
  // 🔍 SECURITY MONITORING OPERATIONS
  // ============================================================================

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(tenantId: string): Promise<any> {
    try {
      // This would aggregate data from multiple security services
      const [threats, events, compliance] = await Promise.all([
        this.orchestrator.getActiveThreats(tenantId, 10),
        this.orchestrator.getSecurityAlerts(tenantId, { limit: 10 }),
        this.getComplianceStatus(tenantId),
      ]);

      return {
        tenantId,
        timestamp: new Date(),
        activeThreats: threats.length,
        recentAlerts: events.length,
        complianceScore: compliance.overallScore || 0,
        threats,
        alerts: events,
        compliance,
      };
    } catch (error) {
      this.logger.error(`Failed to get security dashboard for tenant ${tenantId}`, error);
      return {
        tenantId,
        timestamp: new Date(),
        activeThreats: 0,
        recentAlerts: 0,
        complianceScore: 0,
        threats: [],
        alerts: [],
        compliance: { status: 'unknown' },
      };
    }
  }

  // ============================================================================
  // 🛠️ UTILITY OPERATIONS
  // ============================================================================

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    return this.encryption.generateSecureToken(length);
  }

  /**
   * Generate API key
   */
  generateApiKey(): string {
    return this.encryption.generateApiKey();
  }

  /**
   * Hash API key for storage
   */
  async hashApiKey(apiKey: string): Promise<string> {
    return await this.encryption.hashApiKey(apiKey);
  }

  // ============================================================================
  // 🎯 ORCHESTRATOR PASS-THROUGH (Advanced Operations)
  // ============================================================================

  /**
   * Access the full orchestrator for advanced operations
   * Use this when you need functionality not covered by the facade
   */
  getOrchestrator(): SecurityOrchestratorService {
    return this.orchestrator;
  }

  /**
   * Access encryption service directly
   */
  getEncryption(): EncryptionService {
    return this.encryption;
  }

  /**
   * Access audit service directly
   */
  getAudit(): AuditService {
    return this.audit;
  }

  /**
   * Access threat detection service directly
   */
  getThreatDetection(): ThreatDetectionService {
    return this.threatDetection;
  }

  /**
   * Access compliance service directly
   */
  getCompliance(): ComplianceService {
    return this.compliance;
  }
}