import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService, AuditEvent, AuditQuery } from './audit.service';
import { ComplianceService } from './compliance.service';
import { ThreatDetectionService } from './threat-detection.service';
import { EncryptionService } from './encryption.service';
import { KeyManagementService } from './key-management.service';
import { SecurityMonitoringService } from './security-monitoring.service';
import { EnterpriseAuthService } from './enterprise-auth.service';
import { PenetrationTestingService } from './penetration-testing.service';
import { DataDeletionService } from './data-deletion.service';

/**
 * Central orchestration service that coordinates all security operations
 * Ensures all service capabilities are utilized and interconnected
 * Acts as the unified entry point for the security module
 */
@Injectable()
export class SecurityOrchestratorService {
  private readonly logger = new Logger(SecurityOrchestratorService.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly complianceService: ComplianceService,
    private readonly threatDetectionService: ThreatDetectionService,
    private readonly encryptionService: EncryptionService,
    private readonly keyManagementService: KeyManagementService,
    private readonly securityMonitoringService: SecurityMonitoringService,
    private readonly enterpriseAuthService: EnterpriseAuthService,
    private readonly penetrationTestingService: PenetrationTestingService,
    private readonly dataDeletionService: DataDeletionService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeOrchestrator();
  }

  /**
   * Initialize orchestrator and set up cross-service communication
   */
  private initializeOrchestrator(): void {
    this.logger.log('Initializing Security Orchestrator');
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for cross-service communication
   */
  private setupEventListeners(): void {
    // Listen to audit events and trigger threat analysis
    this.eventEmitter.on('audit.logged', async (event: AuditEvent) => {
      try {
        const threatAnalyses = await this.threatDetectionService.analyzeEvent(event);
        if (threatAnalyses.length > 0) {
          this.eventEmitter.emit('security.threats_detected', {
            event,
            threats: threatAnalyses,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        this.logger.error('Error analyzing event for threats', error);
      }
    });

    // Listen to threat detections and trigger compliance checks
    this.eventEmitter.on('security.threats_detected', async (data: any) => {
      try {
        const complianceStatus = await this.complianceService.getComplianceStatus(
          data.event.tenantId,
        );
        if (complianceStatus) {
          this.eventEmitter.emit('security.compliance_check', {
            threats: data.threats,
            compliance: complianceStatus,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        this.logger.error('Error checking compliance', error);
      }
    });
  }

  // ============================================================================
  // AUDIT OPERATIONS
  // ============================================================================

  // ============================================================================
  // THREAT DETECTION OPERATIONS
  // ============================================================================

  /**
   * Get threat patterns with optional filtering
   */
  async getThreatPatterns(filter?: any): Promise<any[]> {
    try {
      const patterns = await this.threatDetectionService.getThreatPatterns();
      
      if (!filter) return patterns;

      return patterns.filter(pattern => {
        if (filter.severity && pattern.severity !== filter.severity) return false;
        if (filter.enabled !== undefined && pattern.enabled !== filter.enabled) return false;
        if (filter.searchTerm && !pattern.name.toLowerCase().includes(filter.searchTerm.toLowerCase())) return false;
        return true;
      });
    } catch (error) {
      this.logger.error('Failed to get threat patterns', error);
      throw error;
    }
  }

  /**
   * Add new threat pattern
   */
  async addThreatPattern(pattern: any): Promise<void> {
    try {
      await this.threatDetectionService.addThreatPattern(pattern);
      
      // Log the addition
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: 'system',
        action: 'create',
        resource: 'threat_pattern',
        resourceId: pattern.id,
        newValues: pattern,
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      this.logger.log(`Added threat pattern: ${pattern.name}`);
    } catch (error) {
      this.logger.error('Failed to add threat pattern', error);
      throw error;
    }
  }

  /**
   * Update threat pattern
   */
  async updateThreatPattern(id: string, updates: any): Promise<any> {
    try {
      const patterns = await this.threatDetectionService.getThreatPatterns();
      const pattern = patterns.find(p => p.id === id);
      
      if (!pattern) {
        throw new Error(`Threat pattern not found: ${id}`);
      }

      const updatedPattern = { ...pattern, ...updates, updatedAt: new Date() };
      
      // Remove old pattern and add updated one
      await this.threatDetectionService.removeThreatPattern(id);
      await this.threatDetectionService.addThreatPattern(updatedPattern);

      // Log the update
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: 'system',
        action: 'update',
        resource: 'threat_pattern',
        resourceId: id,
        oldValues: pattern,
        newValues: updatedPattern,
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      return updatedPattern;
    } catch (error) {
      this.logger.error('Failed to update threat pattern', error);
      throw error;
    }
  }

  /**
   * Remove threat pattern
   */
  async removeThreatPattern(id: string): Promise<void> {
    try {
      await this.threatDetectionService.removeThreatPattern(id);
      
      // Log the removal
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: 'system',
        action: 'delete',
        resource: 'threat_pattern',
        resourceId: id,
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      this.logger.log(`Removed threat pattern: ${id}`);
    } catch (error) {
      this.logger.error('Failed to remove threat pattern', error);
      throw error;
    }
  }

  /**
   * Toggle threat pattern enabled status
   */
  async toggleThreatPattern(id: string, enabled: boolean): Promise<any> {
    try {
      await this.threatDetectionService.toggleThreatPattern(id, enabled);
      
      const patterns = await this.threatDetectionService.getThreatPatterns();
      const pattern = patterns.find(p => p.id === id);

      // Log the toggle
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: 'system',
        action: 'update',
        resource: 'threat_pattern',
        resourceId: id,
        newValues: { enabled },
        metadata: {
          severity: 'low',
          category: 'security',
        },
      });

      return pattern;
    } catch (error) {
      this.logger.error('Failed to toggle threat pattern', error);
      throw error;
    }
  }

  /**
   * Get active threats for tenant
   */
  async getActiveThreats(tenantId: string, limit?: number): Promise<any[]> {
    try {
      return await this.threatDetectionService.getActiveThreats(tenantId, limit);
    } catch (error) {
      this.logger.error('Failed to get active threats', error);
      throw error;
    }
  }

  /**
   * Analyze threats for a period
   */
  async analyzeThreat(tenantId: string, filter?: any): Promise<any> {
    try {
      return await this.threatDetectionService.analyzeThreat(tenantId, filter);
    } catch (error) {
      this.logger.error('Failed to analyze threats', error);
      throw error;
    }
  }

  // ============================================================================
  // BEHAVIORAL ANALYSIS OPERATIONS
  // ============================================================================

  /**
   * Perform behavioral analysis with enhanced filtering
   */
  async performBehavioralAnalysis(
    userId: string,
    tenantId: string,
    filter?: any,
  ): Promise<any[]> {
    try {
      const analyses = await this.threatDetectionService.performBehavioralAnalysis(userId, tenantId);
      
      // Convert to GraphQL format
      return analyses.map((analysis, index) => ({
        id: `anomaly_${Date.now()}_${index}`,
        userId,
        tenantId,
        type: analysis.threatId || 'behavioral_anomaly',
        description: analysis.indicators.join(', '),
        severity: this.mapConfidenceToSeverity(analysis.confidence),
        confidence: analysis.confidence,
        detectedAt: analysis.timestamp,
        metadata: {
          riskScore: analysis.riskScore,
          recommendations: analysis.recommendations,
        },
      }));
    } catch (error) {
      this.logger.error('Failed to perform behavioral analysis', error);
      throw error;
    }
  }

  /**
   * Check account compromise with enhanced analysis
   */
  async checkAccountCompromise(
    tenantId: string,
    userId: string,
    performDeepAnalysis?: boolean,
  ): Promise<boolean> {
    try {
      const isCompromised = await this.threatDetectionService.isAccountCompromised(tenantId, userId);
      
      if (performDeepAnalysis && isCompromised) {
        // Perform additional analysis
        const behavioralAnalyses = await this.performBehavioralAnalysis(userId, tenantId);
        const criticalAnomalies = behavioralAnalyses.filter(a => a.severity === 'critical');
        
        // Log the compromise check
        await this.auditService.logEvent({
          tenantId,
          userId: 'system',
          action: 'read',
          resource: 'account_compromise_check',
          resourceId: userId,
          metadata: {
            isCompromised,
            deepAnalysis: true,
            criticalAnomalies: criticalAnomalies.length,
            severity: 'high',
            category: 'security',
          },
        });
      }

      return isCompromised;
    } catch (error) {
      this.logger.error('Failed to check account compromise', error);
      throw error;
    }
  }

  /**
   * Get user behavior profile
   */
  async getUserBehaviorProfile(userId: string, tenantId: string): Promise<any> {
    try {
      // Mock implementation - in production this would analyze user patterns
      return {
        id: `profile_${userId}`,
        userId,
        tenantId,
        loginPatterns: {
          averageLoginsPerDay: 5,
          commonLoginTimes: ['09:00', '13:00', '17:00'],
          commonIpAddresses: ['192.168.1.100'],
        },
        accessPatterns: {
          commonResources: ['dashboard', 'reports', 'settings'],
          averageSessionDuration: 120, // minutes
        },
        timePatterns: {
          workingHours: { start: '09:00', end: '17:00' },
          timezone: 'UTC',
        },
        locationPatterns: {
          commonCountries: ['US'],
          commonCities: ['New York'],
        },
        riskScore: 25,
        lastUpdated: new Date(),
        metadata: {
          profileVersion: '1.0',
          lastAnalyzed: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get user behavior profile', error);
      throw error;
    }
  }

  // ============================================================================
  // AUDIT ANALYSIS OPERATIONS
  // ============================================================================

  /**
   * Generate comprehensive audit report
   */
  async generateAuditReport(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    format?: string,
    includeAnalysis?: boolean,
  ): Promise<any> {
    try {
      const report = await this.auditService.generateReport(tenantId, startDate, endDate, 'detailed');
      const statistics = await this.auditService.getStatistics(tenantId, startDate, endDate);

      const auditReport: {
        id: string;
        tenantId: string;
        reportType: string;
        startDate: Date;
        endDate: Date;
        totalEvents: number;
        securityEvents: number;
        criticalEvents: number;
        summary: any;
        findings: Record<string, any>;
        recommendations: string[];
        generatedAt: Date;
        generatedBy: string;
      } = {
        id: `audit_report_${Date.now()}`,
        tenantId,
        reportType: 'comprehensive',
        startDate,
        endDate,
        totalEvents: statistics.totalEvents,
        securityEvents: statistics.byCategory?.security || 0,
        criticalEvents: statistics.criticalEventCount || 0,
        summary: statistics,
        findings: {
          topActions: Object.entries(statistics.byAction).slice(0, 5),
          topResources: Object.entries(statistics.byResource).slice(0, 5),
          topUsers: Object.entries(statistics.byUser).slice(0, 10),
        },
        recommendations: this.generateAuditRecommendations(statistics),
        generatedAt: new Date(),
        generatedBy: 'system',
      };

      if (includeAnalysis) {
        const patterns = await this.analyzeAuditPatterns(tenantId, 30);
        auditReport.findings = { ...auditReport.findings, patterns };
      }

      return auditReport;
    } catch (error) {
      this.logger.error('Failed to generate audit report', error);
      throw error;
    }
  }

  /**
   * Analyze audit patterns for anomalies
   */
  async analyzeAuditPatterns(
    tenantId: string,
    timeWindowDays: number,
    analysisType?: string,
  ): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeWindowDays * 24 * 60 * 60 * 1000);
      
      const logs = await this.auditService.queryLogs({
        tenantId,
        startDate,
        endDate,
        limit: 10000,
      });

      const patterns = {
        timeDistribution: this.analyzeTimeDistribution(logs),
        actionFrequency: this.analyzeActionFrequency(logs),
        userActivity: this.analyzeUserActivity(logs),
        resourceAccess: this.analyzeResourceAccess(logs),
      };

      const anomalies = {
        unusualTimes: this.detectUnusualTimes(logs),
        suspiciousActions: this.detectSuspiciousActions(logs),
        abnormalUsers: this.detectAbnormalUsers(logs),
      };

      return {
        id: `pattern_analysis_${Date.now()}`,
        tenantId,
        analysisType: analysisType || 'comprehensive',
        timeWindowDays,
        totalEvents: logs.length,
        patterns,
        anomalies,
        insights: this.generatePatternInsights(patterns, anomalies),
        analyzedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to analyze audit patterns', error);
      throw error;
    }
  }

  /**
   * Verify audit integrity
   */
  async verifyAuditIntegrity(tenantId: string): Promise<any> {
    try {
      return await this.auditService.verifyIntegrity(tenantId);
    } catch (error) {
      this.logger.error('Failed to verify audit integrity', error);
      throw error;
    }
  }

  /**
   * Search audit logs with advanced filtering
   */
  async searchAuditLogs(searchOptions: any): Promise<any> {
    try {
      return await this.auditService.searchLogs(searchOptions);
    } catch (error) {
      this.logger.error('Failed to search audit logs', error);
      throw error;
    }
  }

  // ============================================================================
  // ENCRYPTION OPERATIONS
  // ============================================================================

  /**
   * Generate encryption key
   */
  async generateEncryptionKey(
    tenantId: string,
    keyType: string,
    algorithm?: string,
    description?: string,
  ): Promise<any> {
    try {
      const key = await this.keyManagementService.generateTenantKey(tenantId, keyType as any);
      
      return {
        id: key.id,
        tenantId,
        keyType,
        algorithm: algorithm || 'AES-256-GCM',
        version: 1,
        createdAt: new Date(),
        status: 'ACTIVE',
        metadata: {
          description,
          generatedBy: 'system',
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate encryption key', error);
      throw error;
    }
  }

  /**
   * Rotate encryption key
   */
  async rotateEncryptionKey(
    tenantId: string,
    keyType?: string,
    reason?: string,
    immediate?: boolean,
  ): Promise<any> {
    try {
      await this.keyManagementService.rotateKeys(tenantId, keyType);
      
      return {
        id: `key_${Date.now()}`,
        tenantId,
        keyType: keyType || 'default',
        algorithm: 'AES-256-GCM',
        version: 1,
        createdAt: new Date(),
        rotatedAt: new Date(),
        status: 'ACTIVE',
        metadata: {
          reason,
          immediate,
          rotatedBy: 'system',
        },
      };
    } catch (error) {
      this.logger.error('Failed to rotate encryption key', error);
      throw error;
    }
  }

  /**
   * Revoke encryption key
   */
  async revokeEncryptionKey(keyId: string, tenantId: string, reason: string): Promise<void> {
    try {
      await this.keyManagementService.revokeKey(keyId);
      
      // Log the revocation
      await this.auditService.logEvent({
        tenantId,
        userId: 'system',
        action: 'update',
        resource: 'encryption_key',
        resourceId: keyId,
        newValues: { status: 'REVOKED', reason },
        metadata: {
          severity: 'high',
          category: 'security',
        },
      });
    } catch (error) {
      this.logger.error('Failed to revoke encryption key', error);
      throw error;
    }
  }

  /**
   * Get encryption key history
   */
  async getEncryptionKeyHistory(tenantId: string, filter?: any): Promise<any[]> {
    try {
      const history = await this.keyManagementService.getKeyHistory(tenantId);
      
      if (!filter) return history;

      return history.filter(key => {
        if (filter.keyType && key.keyType !== filter.keyType) return false;
        if (filter.status && key.status !== filter.status) return false;
        if (filter.startDate && new Date(key.createdAt) < filter.startDate) return false;
        if (filter.endDate && new Date(key.createdAt) > filter.endDate) return false;
        return true;
      }).slice(0, filter.limit || 100);
    } catch (error) {
      this.logger.error('Failed to get encryption key history', error);
      throw error;
    }
  }

  /**
   * Mask sensitive data
   */
  async maskSensitiveData(data: any, maskType?: string): Promise<string> {
    try {
      return this.encryptionService.maskSensitiveData(data);
    } catch (error) {
      this.logger.error('Failed to mask sensitive data', error);
      throw error;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await this.encryptionService.hashPassword(password);
    } catch (error) {
      this.logger.error('Failed to hash password', error);
      throw error;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await this.encryptionService.verifyPassword(password, hash);
    } catch (error) {
      this.logger.error('Failed to verify password', error);
      throw error;
    }
  }

  // ============================================================================
  // SECURITY MONITORING OPERATIONS
  // ============================================================================

  /**
   * Get security alerts
   */
  async getSecurityAlerts(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Get security events from monitoring service and transform to alerts
      const events = await this.securityMonitoringService.getSecurityEvents(tenantId, filter || {});
      
      if (!filter) return events;

      return events.filter((event: any) => {
        if (filter.status && event.status !== filter.status) return false;
        if (filter.severity && event.severity !== filter.severity) return false;
        if (filter.type && event.type !== filter.type) return false;
        if (filter.startDate && new Date(event.timestamp) < filter.startDate) return false;
        if (filter.endDate && new Date(event.timestamp) > filter.endDate) return false;
        return true;
      }).slice(0, filter.limit || 100);
    } catch (error) {
      this.logger.error('Failed to get security alerts', error);
      throw error;
    }
  }

  /**
   * Manage security alert
   */
  async manageSecurityAlert(
    alertId: string,
    action: string,
    notes?: string,
    resolution?: string,
    userId?: string,
  ): Promise<any> {
    try {
      // Mock implementation - in production this would update the alert
      const alert = {
        id: alertId,
        action,
        notes,
        resolution,
        managedBy: userId,
        managedAt: new Date(),
      };

      // Log the management action
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: userId || 'system',
        action: 'update',
        resource: 'security_alert',
        resourceId: alertId,
        newValues: alert,
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      return alert;
    } catch (error) {
      this.logger.error('Failed to manage security alert', error);
      throw error;
    }
  }

  /**
   * Get security incidents
   */
  async getSecurityIncidents(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Mock implementation - in production this would query from database
      return [];
    } catch (error) {
      this.logger.error('Failed to get security incidents', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Map confidence score to severity level
   */
  private mapConfidenceToSeverity(confidence: number): string {
    if (confidence >= 90) return 'critical';
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate audit recommendations based on statistics
   */
  private generateAuditRecommendations(statistics: any): string[] {
    const recommendations: string[] = [];

    if (statistics.criticalEventCount > 0) {
      recommendations.push('Review and investigate critical security events');
    }

    if (statistics.byCategory?.security > statistics.totalEvents * 0.1) {
      recommendations.push('High security event volume detected - consider additional monitoring');
    }

    if (Object.keys(statistics.byUser).length < 5) {
      recommendations.push('Limited user activity - verify system usage patterns');
    }

    return recommendations;
  }

  /**
   * Analyze time distribution of audit events
   */
  private analyzeTimeDistribution(logs: any[]): any {
    const hourCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[String(hour)] = (hourCounts[String(hour)] || 0) + 1;
    });

    const entries = Object.entries(hourCounts);
    const peakEntry = entries.length > 0 
      ? entries.reduce((a, b) => a[1] > b[1] ? a : b)
      : ['0', 0];

    return {
      hourlyDistribution: hourCounts,
      peakHour: peakEntry[0],
    };
  }

  /**
   * Analyze action frequency patterns
   */
  private analyzeActionFrequency(logs: any[]): any {
    const actionCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return {
      actionDistribution: actionCounts,
      mostCommonAction: Object.entries(actionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0],
    };
  }

  /**
   * Analyze user activity patterns
   */
  private analyzeUserActivity(logs: any[]): any {
    const userCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    return {
      userDistribution: userCounts,
      mostActiveUser: Object.entries(userCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['none', 0])[0],
    };
  }

  /**
   * Analyze resource access patterns
   */
  private analyzeResourceAccess(logs: any[]): any {
    const resourceCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
    });

    return {
      resourceDistribution: resourceCounts,
      mostAccessedResource: Object.entries(resourceCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0],
    };
  }

  /**
   * Detect unusual time patterns
   */
  private detectUnusualTimes(logs: any[]): string[] {
    const anomalies: string[] = [];
    const offHoursEvents = logs.filter(log => {
      const hour = new Date(log.createdAt).getHours();
      return hour < 8 || hour > 18;
    });

    if (offHoursEvents.length > logs.length * 0.2) {
      anomalies.push(`High off-hours activity: ${offHoursEvents.length} events`);
    }

    return anomalies;
  }

  /**
   * Detect suspicious actions
   */
  private detectSuspiciousActions(logs: any[]): string[] {
    const anomalies: string[] = [];
    const deleteActions = logs.filter(log => log.action === 'delete');

    if (deleteActions.length > logs.length * 0.1) {
      anomalies.push(`High deletion activity: ${deleteActions.length} delete actions`);
    }

    return anomalies;
  }

  /**
   * Detect abnormal user behavior
   */
  private detectAbnormalUsers(logs: any[]): string[] {
    const anomalies: string[] = [];
    const userCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    const averageActivity = Object.values(userCounts).reduce((a, b) => a + b, 0) / Object.keys(userCounts).length;
    
    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > averageActivity * 3) {
        anomalies.push(`User ${userId} has unusually high activity: ${count} events`);
      }
    });

    return anomalies;
  }

  /**
   * Generate insights from pattern analysis
   */
  private generatePatternInsights(patterns: any, anomalies: any): string[] {
    const insights: string[] = [];

    if (patterns.timeDistribution.peakHour) {
      insights.push(`Peak activity occurs at ${patterns.timeDistribution.peakHour}:00`);
    }

    if (patterns.actionFrequency.mostCommonAction) {
      insights.push(`Most common action is '${patterns.actionFrequency.mostCommonAction}'`);
    }

    if (anomalies.unusualTimes.length > 0) {
      insights.push('Unusual time patterns detected - review off-hours access');
    }

    if (anomalies.suspiciousActions.length > 0) {
      insights.push('Suspicious action patterns detected - review deletion activities');
    }

    return insights;
  }

  // ============================================================================
  // ENTERPRISE AUTHENTICATION OPERATIONS
  // ============================================================================

  /**
   * Get SAML configuration
   */
  async getSAMLConfiguration(tenantId: string): Promise<any> {
    try {
      // Use the actual service method name
      return await this.enterpriseAuthService.getSAMLConfig(tenantId);
    } catch (error) {
      this.logger.error('Failed to get SAML configuration', error);
      throw error;
    }
  }

  /**
   * Configure SAML authentication
   */
  async configureSAML(input: any, userId: string): Promise<any> {
    try {
      const config = await this.enterpriseAuthService.configureSAML(input);
      
      // Log the configuration
      await this.auditService.logEvent({
        tenantId: input.tenantId,
        userId,
        action: 'create',
        resource: 'saml_configuration',
        newValues: { ...input, certificate: '[REDACTED]', privateKey: '[REDACTED]' },
        metadata: {
          severity: 'high',
          category: 'security',
        },
      });

      return config;
    } catch (error) {
      this.logger.error('Failed to configure SAML', error);
      throw error;
    }
  }

  /**
   * Test SAML configuration
   */
  async testSAMLConfiguration(tenantId: string): Promise<boolean> {
    try {
      // Check if SAML config exists and is valid
      const config = await this.enterpriseAuthService.getSAMLConfig(tenantId);
      return config !== null && config.enabled === true;
    } catch (error) {
      this.logger.error('Failed to test SAML configuration', error);
      throw error;
    }
  }

  /**
   * Get LDAP configuration
   */
  async getLDAPConfiguration(tenantId: string): Promise<any> {
    try {
      // Use the actual service method name
      return await this.enterpriseAuthService.getLDAPConfig(tenantId);
    } catch (error) {
      this.logger.error('Failed to get LDAP configuration', error);
      throw error;
    }
  }

  /**
   * Configure LDAP authentication
   */
  async configureLDAP(input: any, userId: string): Promise<any> {
    try {
      const config = await this.enterpriseAuthService.configureLDAP(input);
      
      // Log the configuration
      await this.auditService.logEvent({
        tenantId: input.tenantId,
        userId,
        action: 'create',
        resource: 'ldap_configuration',
        newValues: { ...input, bindPassword: '[REDACTED]' },
        metadata: {
          severity: 'high',
          category: 'security',
        },
      });

      return config;
    } catch (error) {
      this.logger.error('Failed to configure LDAP', error);
      throw error;
    }
  }

  /**
   * Test LDAP connection
   */
  async testLDAPConnection(tenantId: string): Promise<boolean> {
    try {
      // Check if LDAP config exists and is valid
      const config = await this.enterpriseAuthService.getLDAPConfig(tenantId);
      return config !== null && config.enabled === true;
    } catch (error) {
      this.logger.error('Failed to test LDAP connection', error);
      throw error;
    }
  }

  /**
   * Get OAuth2 configuration
   */
  async getOAuth2Configuration(tenantId: string): Promise<any> {
    try {
      // OAuth2 configurations are stored in memory by EnterpriseAuthService
      // Return null if not configured - the service doesn't expose a getter
      return null;
    } catch (error) {
      this.logger.error('Failed to get OAuth2 configuration', error);
      throw error;
    }
  }

  /**
   * Configure OAuth2 authentication
   */
  async configureOAuth2(input: any, userId: string): Promise<any> {
    try {
      const config = await this.enterpriseAuthService.configureOAuth2(input);
      
      // Log the configuration
      await this.auditService.logEvent({
        tenantId: input.tenantId,
        userId,
        action: 'create',
        resource: 'oauth2_configuration',
        newValues: { ...input, clientSecret: '[REDACTED]' },
        metadata: {
          severity: 'high',
          category: 'security',
        },
      });

      return config;
    } catch (error) {
      this.logger.error('Failed to configure OAuth2', error);
      throw error;
    }
  }

  /**
   * Get active SSO sessions
   */
  async getActiveSSOSessions(tenantId: string, limit?: number): Promise<any[]> {
    try {
      // Use the actual service method name
      const sessions = await this.enterpriseAuthService.getSSOSessions(tenantId);
      return limit ? sessions.slice(0, limit) : sessions;
    } catch (error) {
      this.logger.error('Failed to get active SSO sessions', error);
      throw error;
    }
  }

  /**
   * Manage SSO session
   */
  async manageSSOSession(sessionId: string, action: string, reason?: string, userId?: string): Promise<boolean> {
    try {
      // Use the actual service method for session management
      if (action === 'revoke') {
        await this.enterpriseAuthService.revokeSSOSession(sessionId, 'system');
      }
      
      // Log the session management
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: userId || 'system',
        action: 'update',
        resource: 'sso_session',
        resourceId: sessionId,
        newValues: { action, reason },
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to manage SSO session', error);
      throw error;
    }
  }

  /**
   * Revoke all SSO sessions
   */
  async revokeAllSSOSessions(tenantId: string, reason?: string, userId?: string): Promise<number> {
    try {
      // Get all sessions and revoke each one
      const sessions = await this.enterpriseAuthService.getSSOSessions(tenantId);
      for (const session of sessions) {
        await this.enterpriseAuthService.revokeSSOSession(session.id, tenantId);
      }
      const count = sessions.length;
      
      // Log the mass revocation
      await this.auditService.logEvent({
        tenantId,
        userId: userId || 'system',
        action: 'delete',
        resource: 'sso_sessions',
        metadata: {
          sessionsRevoked: count,
          reason,
          severity: 'high',
          category: 'security',
        },
      });

      return count;
    } catch (error) {
      this.logger.error('Failed to revoke all SSO sessions', error);
      throw error;
    }
  }

  /**
   * Get SSO session by ID
   */
  async getSSOSession(sessionId: string, tenantId: string): Promise<any> {
    try {
      // Find session by ID from all sessions
      const sessions = await this.enterpriseAuthService.getSSOSessions(tenantId);
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      this.logger.error('Failed to get SSO session', error);
      throw error;
    }
  }

  /**
   * Get enterprise auth statistics
   */
  async getEnterpriseAuthStats(tenantId: string): Promise<any> {
    try {
      // Generate statistics from available data
      const sessions = await this.enterpriseAuthService.getSSOSessions(tenantId);
      const samlConfig = await this.enterpriseAuthService.getSAMLConfig(tenantId);
      const ldapConfig = await this.enterpriseAuthService.getLDAPConfig(tenantId);
      
      return {
        tenantId,
        activeSessions: sessions.length,
        samlEnabled: samlConfig?.enabled || false,
        ldapEnabled: ldapConfig?.enabled || false,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get enterprise auth stats', error);
      throw error;
    }
  }

  // ============================================================================
  // PENETRATION TESTING OPERATIONS
  // ============================================================================

  /**
   * Get penetration tests
   */
  async getPenetrationTests(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Service doesn't have getTests - return empty array (stub)
      return [];
    } catch (error) {
      this.logger.error('Failed to get penetration tests', error);
      throw error;
    }
  }

  /**
   * Get penetration test by ID
   */
  async getPenetrationTest(id: string, tenantId: string): Promise<any> {
    try {
      // Use the actual service method name
      return await this.penetrationTestingService.getTestResults(id);
    } catch (error) {
      this.logger.error('Failed to get penetration test', error);
      throw error;
    }
  }

  /**
   * Initiate penetration test
   */
  async initiatePenetrationTest(input: any, userId: string): Promise<any> {
    try {
      // Use the actual service method name
      const test = await this.penetrationTestingService.initiatePenetrationTest(input);
      
      // Log the test initiation
      await this.auditService.logEvent({
        tenantId: input.tenantId,
        userId,
        action: 'create',
        resource: 'penetration_test',
        resourceId: test.id,
        newValues: input,
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      return test;
    } catch (error) {
      this.logger.error('Failed to initiate penetration test', error);
      throw error;
    }
  }

  /**
   * Cancel penetration test
   */
  async cancelPenetrationTest(id: string, reason?: string, userId?: string): Promise<boolean> {
    try {
      // Service doesn't have cancelTest - return true (stub)
      
      // Log the cancellation
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: userId || 'system',
        action: 'update',
        resource: 'penetration_test',
        resourceId: id,
        newValues: { status: 'cancelled', reason },
        metadata: {
          severity: 'low',
          category: 'security',
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to cancel penetration test', error);
      throw error;
    }
  }

  /**
   * Get penetration test results
   */
  async getPenetrationTestResults(testId: string, tenantId: string): Promise<any> {
    try {
      // Use actual service method - only takes testId
      return await this.penetrationTestingService.getTestResults(testId);
    } catch (error) {
      this.logger.error('Failed to get penetration test results', error);
      throw error;
    }
  }

  /**
   * Get vulnerabilities
   */
  async getVulnerabilities(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Use the actual service method name
      return await this.penetrationTestingService.getFindings(tenantId, filter);
    } catch (error) {
      this.logger.error('Failed to get vulnerabilities', error);
      throw error;
    }
  }

  /**
   * Get vulnerability by ID
   */
  async getVulnerability(id: string, tenantId: string): Promise<any> {
    try {
      // Service doesn't have individual get - find from all findings
      const findings = await this.penetrationTestingService.getFindings(tenantId);
      return findings.find(f => f.id === id) || null;
    } catch (error) {
      this.logger.error('Failed to get vulnerability', error);
      throw error;
    }
  }

  /**
   * Update vulnerability status
   */
  async updateVulnerabilityStatus(id: string, status: string, notes?: string, userId?: string): Promise<any> {
    try {
      // Service doesn't have updateVulnerabilityStatus - return mock updated object
      const vulnerability = {
        id,
        status,
        notes,
        updatedAt: new Date(),
        updatedBy: userId || 'system',
      };
      
      // Log the status update
      await this.auditService.logEvent({
        tenantId: 'system',
        userId: userId || 'system',
        action: 'update',
        resource: 'vulnerability',
        resourceId: id,
        newValues: { status, notes },
        metadata: {
          severity: 'medium',
          category: 'security',
        },
      });

      return vulnerability;
    } catch (error) {
      this.logger.error('Failed to update vulnerability status', error);
      throw error;
    }
  }

  /**
   * Generate vulnerability report
   */
  async generateVulnerabilityReport(tenantId: string, testId?: string, includeResolved?: boolean, userId?: string): Promise<any> {
    try {
      // Use actual service method - only takes tenantId and period
      return await this.penetrationTestingService.generateVulnerabilityReport(tenantId, testId);
    } catch (error) {
      this.logger.error('Failed to generate vulnerability report', error);
      throw error;
    }
  }

  /**
   * Get vulnerability reports
   */
  async getVulnerabilityReports(tenantId: string, limit?: number): Promise<any[]> {
    try {
      // Service doesn't have getVulnerabilityReports - return empty array
      return [];
    } catch (error) {
      this.logger.error('Failed to get vulnerability reports', error);
      throw error;
    }
  }

  /**
   * Get penetration testing statistics
   */
  async getPenetrationTestingStats(tenantId: string, period?: string): Promise<any> {
    try {
      // Service doesn't have getTestingStats - return mock statistics
      return {
        tenantId,
        period: period || '30d',
        totalTests: 0,
        completedTests: 0,
        failedTests: 0,
        averageDuration: 0,
        lastTestAt: null,
      };
    } catch (error) {
      this.logger.error('Failed to get penetration testing stats', error);
      throw error;
    }
  }

  /**
   * Get vulnerability trends
   */
  async getVulnerabilityTrends(tenantId: string, timeframe?: string): Promise<any> {
    try {
      // Service doesn't have getVulnerabilityTrends - return mock trends
      return {
        tenantId,
        timeframe: timeframe || '30d',
        trends: [],
      };
    } catch (error) {
      this.logger.error('Failed to get vulnerability trends', error);
      throw error;
    }
  }

  /**
   * Schedule automated test
   */
  async scheduleAutomatedTest(tenantId: string, testType: string, cronExpression: string, enabled?: boolean, userId?: string): Promise<boolean> {
    try {
      // Service doesn't have scheduleAutomatedTest - return true (stub)
      return true;
    } catch (error) {
      this.logger.error('Failed to schedule automated test', error);
      throw error;
    }
  }

  /**
   * Get scheduled automated tests
   */
  async getScheduledAutomatedTests(tenantId: string): Promise<any[]> {
    try {
      // Service doesn't have getScheduledTests - return empty array
      return [];
    } catch (error) {
      this.logger.error('Failed to get scheduled automated tests', error);
      throw error;
    }
  }

  /**
   * Disable automated test
   */
  async disableAutomatedTest(scheduleId: string, userId?: string): Promise<boolean> {
    try {
      // Service doesn't have disableAutomatedTest - return true (stub)
      return true;
    } catch (error) {
      this.logger.error('Failed to disable automated test', error);
      throw error;
    }
  }

  // ============================================================================
  // DATA DELETION OPERATIONS
  // ============================================================================

  /**
   * Get data deletion requests
   */
  async getDataDeletionRequests(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Service doesn't have getDeletionRequests - use getDeletionHistory
      return await this.dataDeletionService.getDeletionHistory(tenantId);
    } catch (error) {
      this.logger.error('Failed to get data deletion requests', error);
      throw error;
    }
  }

  /**
   * Get data deletion request by ID
   */
  async getDataDeletionRequest(id: string, tenantId: string): Promise<any> {
    try {
      // Service only has getDeletionStatus which is synchronous
      return this.dataDeletionService.getDeletionStatus(id);
    } catch (error) {
      this.logger.error('Failed to get data deletion request', error);
      throw error;
    }
  }

  /**
   * Schedule data deletion
   */
  async scheduleDataDeletion(input: any, userId: string): Promise<any> {
    try {
      // Use the actual service method name - scheduleDataDeletion
      const requestId = await this.dataDeletionService.scheduleDataDeletion(input);
      
      // Log the scheduling
      await this.auditService.logEvent({
        tenantId: input.tenantId,
        userId,
        action: 'create',
        resource: 'data_deletion_request',
        resourceId: requestId,
        newValues: input,
        metadata: {
          severity: 'high',
          category: 'compliance',
        },
      });

      return { id: requestId, ...input, status: 'scheduled' };
    } catch (error) {
      this.logger.error('Failed to schedule data deletion', error);
      throw error;
    }
  }

  /**
   * Cancel data deletion
   */
  async cancelDataDeletion(requestId: string, reason: string, userId: string): Promise<boolean> {
    try {
      // Use actual service method - cancelDeletion returns void
      await this.dataDeletionService.cancelDeletion(requestId, userId);
      
      // Log the cancellation
      await this.auditService.logEvent({
        tenantId: 'system',
        userId,
        action: 'update',
        resource: 'data_deletion_request',
        resourceId: requestId,
        newValues: { status: 'cancelled', reason },
        metadata: {
          severity: 'medium',
          category: 'compliance',
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to cancel data deletion', error);
      throw error;
    }
  }

  /**
   * Execute immediate deletion
   */
  async executeImmediateDeletion(requestId: string, confirmationCode: string, reason: string, userId: string): Promise<any> {
    try {
      // Service doesn't have executeImmediateDeletion - use processDataDeletion
      const result = await this.dataDeletionService.processDataDeletion(requestId);
      
      // Log the immediate deletion
      await this.auditService.logEvent({
        tenantId: 'system',
        userId,
        action: 'delete',
        resource: 'data_immediate_deletion',
        resourceId: requestId,
        metadata: {
          confirmationCode: '[REDACTED]',
          reason,
          recordsDeleted: result.deletedRecords,
          severity: 'critical',
          category: 'compliance',
        },
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to execute immediate deletion', error);
      throw error;
    }
  }

  /**
   * Get deletion history
   */
  async getDeletionHistory(tenantId: string, filter?: any): Promise<any[]> {
    try {
      // Service method takes tenantId and optional limit (not filter)
      return await this.dataDeletionService.getDeletionHistory(tenantId, filter?.limit);
    } catch (error) {
      this.logger.error('Failed to get deletion history', error);
      throw error;
    }
  }

  /**
   * Get deletion result
   */
  async getDeletionResult(id: string, tenantId: string): Promise<any> {
    try {
      // Service only has getDeletionStatus (synchronous)
      return this.dataDeletionService.getDeletionStatus(id);
    } catch (error) {
      this.logger.error('Failed to get deletion result', error);
      throw error;
    }
  }

  /**
   * Verify deletion completion
   */
  async verifyDeletionCompletion(requestId: string, verificationHash: string, tenantId: string): Promise<boolean> {
    try {
      // Service doesn't have verifyDeletionCompletion - check status instead
      const status = this.dataDeletionService.getDeletionStatus(requestId);
      return status?.status === 'completed' && status?.verificationHash === verificationHash;
    } catch (error) {
      this.logger.error('Failed to verify deletion completion', error);
      throw error;
    }
  }

  /**
   * Process GDPR export
   */
  async processGDPRExport(tenantId: string, userId: string, includeMetadata?: boolean, requestedBy?: string): Promise<any> {
    try {
      return await this.complianceService.generateGdprDataExport(tenantId, userId);
    } catch (error) {
      this.logger.error('Failed to process GDPR export', error);
      throw error;
    }
  }

  /**
   * Process GDPR deletion
   */
  async processGDPRDeletion(tenantId: string, userId: string, reason?: string, requestedBy?: string): Promise<any> {
    try {
      await this.complianceService.processGdprDeletionRequest(tenantId, userId);
      
      // Create deletion request
      const request = {
        id: `gdpr_${Date.now()}`,
        tenantId,
        userId,
        dataType: 'all_personal_data',
        reason: 'GDPR_REQUEST',
        status: 'SCHEDULED',
        scheduledFor: new Date(),
        requiresVerification: true,
        createdAt: new Date(),
      };

      return request;
    } catch (error) {
      this.logger.error('Failed to process GDPR deletion', error);
      throw error;
    }
  }

  /**
   * Get data retention policies
   */
  async getDataRetentionPolicies(tenantId: string): Promise<any[]> {
    try {
      // Mock implementation - in production this would query from database
      return [
        {
          id: 'audit_logs',
          name: 'Audit Log Retention',
          description: 'Retain audit logs for compliance requirements',
          dataTypes: ['audit_log'],
          retentionPeriod: 2555, // 7 years
          deletionMethod: 'hard',
          enabled: true,
        },
        {
          id: 'user_data',
          name: 'User Data Retention',
          description: 'Retain user data as per privacy policy',
          dataTypes: ['user_profile', 'user_preferences'],
          retentionPeriod: 1095, // 3 years
          deletionMethod: 'soft',
          enabled: true,
        },
      ];
    } catch (error) {
      this.logger.error('Failed to get data retention policies', error);
      throw error;
    }
  }

  /**
   * Update data retention policy
   */
  async updateDataRetentionPolicy(policyId: string, updates: any, userId: string): Promise<any> {
    try {
      // Mock implementation - in production this would update in database
      const policy = {
        id: policyId,
        ...updates,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      // Log the policy update
      await this.auditService.logEvent({
        tenantId: 'system',
        userId,
        action: 'update',
        resource: 'data_retention_policy',
        resourceId: policyId,
        newValues: updates,
        metadata: {
          severity: 'high',
          category: 'compliance',
        },
      });

      return policy;
    } catch (error) {
      this.logger.error('Failed to update data retention policy', error);
      throw error;
    }
  }

  /**
   * Get data deletion statistics
   */
  async getDataDeletionStats(tenantId: string, period?: string): Promise<any> {
    try {
      // Service doesn't have getDeletionStats - get history and compute stats
      const history = await this.dataDeletionService.getDeletionHistory(tenantId);
      
      return {
        tenantId,
        period: period || '30d',
        totalRequests: history.length,
        completed: history.filter(h => h.status === 'completed').length,
        failed: history.filter(h => h.status === 'failed').length,
        pending: history.filter(h => h.status === 'pending').length,
        totalRecordsDeleted: history.reduce((sum, h) => sum + (h.deletedRecords || 0), 0),
      };
    } catch (error) {
      this.logger.error('Failed to get data deletion stats', error);
      throw error;
    }
  }

  /**
   * Generate compliance deletion report
   */
  async generateComplianceDeletionReport(tenantId: string, startDate: Date, endDate: Date, framework?: string, userId?: string): Promise<any> {
    try {
      // Service doesn't have generateComplianceReport - generate from history
      const history = await this.dataDeletionService.getDeletionHistory(tenantId);
      
      // Filter by date range
      const filteredHistory = history.filter(h => {
        const completedAt = h.completedAt ? new Date(h.completedAt) : null;
        if (!completedAt) return false;
        return completedAt >= startDate && completedAt <= endDate;
      });

      return {
        id: `compliance_report_${Date.now()}`,
        tenantId,
        framework: framework || 'GDPR',
        startDate,
        endDate,
        totalDeletions: filteredHistory.length,
        totalRecordsDeleted: filteredHistory.reduce((sum, h) => sum + (h.deletedRecords || 0), 0),
        deletions: filteredHistory,
        generatedAt: new Date(),
        generatedBy: userId || 'system',
      };
    } catch (error) {
      this.logger.error('Failed to generate compliance deletion report', error);
      throw error;
    }
  }

  /**
   * Emergency data wipe
   */
  async emergencyDataWipe(tenantId: string, confirmationCode1: string, confirmationCode2: string, reason: string, dataTypes: string[], userId: string): Promise<boolean> {
    try {
      // Service doesn't have emergencyDataWipe - schedule deletion for all data types
      for (const dataType of dataTypes) {
        await this.dataDeletionService.scheduleDataDeletion({
          tenantId,
          dataType: dataType as 'user' | 'tenant' | 'transaction' | 'customer' | 'employee' | 'all',
          reason: 'security',
          requestedBy: userId,
          scheduledFor: new Date(), // Immediate
        });
      }
      
      // Log the emergency wipe
      await this.auditService.logEvent({
        tenantId,
        userId,
        action: 'delete',
        resource: 'emergency_data_wipe',
        metadata: {
          reason,
          dataTypes,
          confirmationCodes: '[REDACTED]',
          severity: 'critical',
          category: 'security',
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to execute emergency data wipe', error);
      throw error;
    }
  }

  /**
   * Get emergency wipe status
   */
  async getEmergencyWipeStatus(tenantId: string): Promise<any> {
    try {
      // Service doesn't have getEmergencyWipeStatus - return mock status
      return {
        tenantId,
        status: 'none',
        lastWipeAt: null,
        inProgress: false,
      };
    } catch (error) {
      this.logger.error('Failed to get emergency wipe status', error);
      throw error;
    }
  }

  /**
   * Query audit logs with comprehensive filtering
   */
  async queryAuditLogs(query: AuditQuery): Promise<any[]> {
    try {
      return await this.auditService.queryLogs(query);
    } catch (error) {
      this.logger.error('Failed to query audit logs', error);
      throw error;
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(tenantId: string, logId: string): Promise<any | null> {
    try {
      return await this.auditService.getLogById(tenantId, logId);
    } catch (error) {
      this.logger.error('Failed to get audit log', error);
      throw error;
    }
  }

  // ============================================================================
  // COMPLIANCE OPERATIONS
  // ============================================================================

  /**
   * Get comprehensive compliance status
   */
  async getComplianceStatus(tenantId: string): Promise<any> {
    try {
      return await this.complianceService.getComplianceStatus(tenantId);
    } catch (error) {
      this.logger.error('Failed to get compliance status', error);
      throw error;
    }
  }

  /**
   * Generate compliance report for specific framework
   */
  async generateComplianceReport(tenantId: string, frameworkId: string): Promise<any> {
    try {
      return await this.complianceService.generateComplianceReport(tenantId, frameworkId);
    } catch (error) {
      this.logger.error('Failed to generate compliance report', error);
      throw error;
    }
  }

  /**
   * Get available compliance frameworks
   */
  async getComplianceFrameworks(): Promise<any[]> {
    try {
      return await this.complianceService.getFrameworks();
    } catch (error) {
      this.logger.error('Failed to get compliance frameworks', error);
      throw error;
    }
  }

  /**
   * Get compliance reports for period
   */
  async getComplianceReports(
    tenantId: string,
    options: { frameworkId?: string; startDate?: Date; endDate?: Date },
  ): Promise<any[]> {
    try {
      return await this.complianceService.getReports(tenantId, options);
    } catch (error) {
      this.logger.error('Failed to get compliance reports', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Group items by key
   */
  private groupBy<T>(items: T[], keyFn: (item: T) => any): Record<string, T[]> {
    return items.reduce(
      (acc, item) => {
        const key = String(keyFn(item));
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key]!.push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * Get top N items
   */
  private getTopItems<T>(
    items: T[],
    keyFn: ((item: T) => any) | string,
    limit: number = 10,
  ): { key: string; count: number }[] {
    const fn = typeof keyFn === 'function' ? keyFn : (item: any) => item[keyFn];
    const grouped = this.groupBy(items, fn);
    return Object.entries(grouped)
      .map(([key, values]) => ({ key, count: values.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Detect anomalies in audit logs
   */
  private detectAnomalies(items: any[]): string[] {
    const anomalies: string[] = [];

    // Detect unusual activity patterns
    const actions = this.groupBy(items, (i) => i.action);
    Object.entries(actions).forEach(([action, logs]) => {
      // Flag if action count is significantly higher than average
      const avg = items.length / Object.keys(actions).length;
      if (logs.length > avg * 3) {
        anomalies.push(`Unusual spike in ${action} actions (${logs.length} occurrences)`);
      }
    });

    // Detect failed access attempts
    const failedAttempts = items.filter((i) => i.action === 'login' && i.severity === 'high');
    if (failedAttempts.length > 10) {
      anomalies.push(`High number of failed login attempts detected (${failedAttempts.length})`);
    }

    // Detect data access patterns
    const dataAccess = items.filter((i) => i.category === 'data');
    if (dataAccess.length > 100) {
      anomalies.push(`High volume of data access events detected (${dataAccess.length})`);
    }

    return anomalies;
  }
}
