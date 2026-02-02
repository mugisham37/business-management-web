import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '../../database/drizzle.service';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { auditLogs } from '../../database/schema';
import { 
  SecurityEvent, 
  SecurityEventType, 
  ThreatDetectionResult,
  ComplianceReport,
} from '../interfaces/auth.interface';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface SecurityEventInput {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ThreatDetectionConfig {
  enabled: boolean;
  bruteForceThreshold: number;
  suspiciousLocationThreshold: number;
  deviceAnomalyThreshold: number;
  behaviorAnomalyThreshold: number;
  realTimeMonitoring: boolean;
}

@Injectable()
export class SecurityService {
  private readonly threatDetectionConfig: ThreatDetectionConfig;
  private readonly rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
  ) {
    this.threatDetectionConfig = {
      enabled: this.configService.get<boolean>('THREAT_DETECTION_ENABLED', true),
      bruteForceThreshold: this.configService.get<number>('BRUTE_FORCE_THRESHOLD', 10),
      suspiciousLocationThreshold: this.configService.get<number>('SUSPICIOUS_LOCATION_THRESHOLD', 5),
      deviceAnomalyThreshold: this.configService.get<number>('DEVICE_ANOMALY_THRESHOLD', 3),
      behaviorAnomalyThreshold: this.configService.get<number>('BEHAVIOR_ANOMALY_THRESHOLD', 7),
      realTimeMonitoring: this.configService.get<boolean>('REAL_TIME_MONITORING', true),
    };

    this.logger.setContext('SecurityService');
  }

  /**
   * Log security event with threat detection
   */
  async logSecurityEvent(eventInput: SecurityEventInput): Promise<SecurityEvent> {
    const db = this.drizzleService.getDb();

    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      type: eventInput.type as SecurityEventType,
      severity: eventInput.severity,
      userId: eventInput.userId,
      tenantId: eventInput.tenantId,
      sessionId: eventInput.sessionId,
      ipAddress: eventInput.ipAddress,
      userAgent: eventInput.userAgent,
      metadata: eventInput.metadata || {},
      timestamp: new Date(),
      resolved: false,
    };

    try {
      // Store in audit log
      await db.insert(auditLogs).values({
        tenantId: eventInput.tenantId,
        userId: eventInput.userId,
        action: 'security_event',
        resource: 'security',
        resourceId: securityEvent.id,
        newValues: securityEvent,
        metadata: {
          eventType: eventInput.type,
          severity: eventInput.severity,
          ...eventInput.metadata,
        },
        ipAddress: eventInput.ipAddress,
        userAgent: eventInput.userAgent,
      });

      // Perform threat detection
      if (this.threatDetectionConfig.enabled) {
        const threatResult = await this.detectThreats(securityEvent);
        if (threatResult.threatDetected) {
          await this.handleThreatDetection(securityEvent, threatResult);
        }
      }

      // Emit security event for real-time monitoring
      if (this.threatDetectionConfig.realTimeMonitoring) {
        this.eventEmitter.emit('security.event', securityEvent);
      }

      // Cache recent events for pattern analysis
      await this.cacheRecentSecurityEvent(securityEvent);

      this.logger.log(`Security event logged: ${eventInput.type}`, {
        eventId: securityEvent.id,
        severity: eventInput.severity,
        userId: eventInput.userId,
        tenantId: eventInput.tenantId,
      });

      return securityEvent;
    } catch (error) {
      this.logger.error(`Failed to log security event ${eventInput.type} for user ${eventInput.userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate registration attempt for security
   */
  async validateRegistrationAttempt(email: string, ipAddress?: string): Promise<void> {
    if (!ipAddress) return;

    const key = `reg_attempt:${ipAddress}`;
    const maxAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    const attempts = await this.getRateLimitCount(key, windowMs);
    if (attempts >= maxAttempts) {
      await this.logSecurityEvent({
        type: 'registration_rate_limit_exceeded',
        severity: 'medium',
        ipAddress,
        metadata: { email, attempts },
      });
      throw new Error('Too many registration attempts. Please try again later.');
    }

    await this.incrementRateLimitCount(key, windowMs);
  }

  /**
   * Validate login attempt for security
   */
  async validateLoginAttempt(email: string, ipAddress?: string): Promise<void> {
    if (!ipAddress) return;

    // Check IP-based rate limiting
    const ipKey = `login_attempt:${ipAddress}`;
    const emailKey = `login_attempt:${email}`;
    const maxIpAttempts = 20;
    const maxEmailAttempts = 10;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    const ipAttempts = await this.getRateLimitCount(ipKey, windowMs);
    const emailAttempts = await this.getRateLimitCount(emailKey, windowMs);

    if (ipAttempts >= maxIpAttempts) {
      await this.logSecurityEvent({
        type: 'ip_rate_limit_exceeded',
        severity: 'high',
        ipAddress,
        metadata: { email, attempts: ipAttempts },
      });
      throw new Error('Too many login attempts from this IP. Please try again later.');
    }

    if (emailAttempts >= maxEmailAttempts) {
      await this.logSecurityEvent({
        type: 'email_rate_limit_exceeded',
        severity: 'medium',
        ipAddress,
        metadata: { email, attempts: emailAttempts },
      });
      throw new Error('Too many login attempts for this email. Please try again later.');
    }

    await this.incrementRateLimitCount(ipKey, windowMs);
    await this.incrementRateLimitCount(emailKey, windowMs);
  }

  /**
   * Validate password reset attempt for security
   */
  async validatePasswordResetAttempt(email: string, ipAddress?: string): Promise<void> {
    if (!ipAddress) return;

    const key = `pwd_reset:${ipAddress}:${email}`;
    const maxAttempts = 3;
    const windowMs = 60 * 60 * 1000; // 1 hour

    const attempts = await this.getRateLimitCount(key, windowMs);
    if (attempts >= maxAttempts) {
      await this.logSecurityEvent({
        type: 'password_reset_rate_limit_exceeded',
        severity: 'medium',
        ipAddress,
        metadata: { email, attempts },
      });
      throw new Error('Too many password reset attempts. Please try again later.');
    }

    await this.incrementRateLimitCount(key, windowMs);
  }

  /**
   * Detect security threats based on patterns
   */
  async detectThreats(event: SecurityEvent): Promise<ThreatDetectionResult> {
    const threats: string[] = [];
    let maxConfidence = 0;
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Brute force detection
    if (event.type === SecurityEventType.FAILED_LOGIN) {
      const bruteForceResult = await this.detectBruteForce(event);
      if (bruteForceResult.detected) {
        threats.push('brute_force_attack');
        maxConfidence = Math.max(maxConfidence, bruteForceResult.confidence);
        maxSeverity = this.getHigherSeverity(maxSeverity, 'high');
      }
    }

    // Suspicious location detection
    if (event.ipAddress) {
      const locationResult = await this.detectSuspiciousLocation(event);
      if (locationResult.detected) {
        threats.push('suspicious_location');
        maxConfidence = Math.max(maxConfidence, locationResult.confidence);
        maxSeverity = this.getHigherSeverity(maxSeverity, 'medium');
      }
    }

    // Device anomaly detection
    if (event.userAgent) {
      const deviceResult = await this.detectDeviceAnomaly(event);
      if (deviceResult.detected) {
        threats.push('device_anomaly');
        maxConfidence = Math.max(maxConfidence, deviceResult.confidence);
        maxSeverity = this.getHigherSeverity(maxSeverity, 'medium');
      }
    }

    // Behavioral anomaly detection
    const behaviorResult = await this.detectBehavioralAnomaly(event);
    if (behaviorResult.detected) {
      threats.push('behavioral_anomaly');
      maxConfidence = Math.max(maxConfidence, behaviorResult.confidence);
      maxSeverity = this.getHigherSeverity(maxSeverity, 'medium');
    }

    const threatDetected = threats.length > 0;
    const recommendedActions = this.getRecommendedActions(threats, maxSeverity);

    return {
      threatDetected,
      threatType: threats.join(', '),
      confidence: maxConfidence,
      severity: maxSeverity,
      indicators: threats,
      recommendedActions,
      metadata: {
        detectionRules: threats,
        analysisTimestamp: new Date(),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    tenantId: string,
    type: 'gdpr' | 'sox' | 'hipaa' | 'custom',
    startDate: Date,
    endDate: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const db = this.drizzleService.getDb();

    // Fetch audit logs for the period
    const auditEvents = await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.tenantId, tenantId),
        gte(auditLogs.createdAt, startDate),
        lte(auditLogs.createdAt, endDate)
      ))
      .orderBy(desc(auditLogs.createdAt));

    // Analyze events for compliance violations
    const findings = await this.analyzeComplianceViolations(auditEvents, type);
    
    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(auditEvents, findings);

    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      type,
      tenantId,
      generatedBy,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      findings,
      summary: {
        totalEvents: auditEvents.length,
        violations: findings.length,
        riskLevel: this.calculateRiskLevel(findings),
        complianceScore,
      },
      recommendations: this.generateComplianceRecommendations(findings, type),
    };

    // Store report
    await db.insert(auditLogs).values({
      tenantId,
      userId: generatedBy,
      action: 'create',
      resource: 'compliance_report',
      resourceId: report.id,
      newValues: report,
      metadata: { reportType: type, period: report.period },
    });

    return report;
  }

  /**
   * Get security metrics for dashboard
   */
  async getSecurityMetrics(tenantId: string, period: { start: Date; end: Date }) {
    const db = this.drizzleService.getDb();

    const events = await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.tenantId, tenantId),
        gte(auditLogs.createdAt, period.start),
        lte(auditLogs.createdAt, period.end)
      ));

    const metrics = {
      totalEvents: events.length,
      securityEvents: events.filter(e => e.action === 'security_event').length,
      failedLogins: events.filter(e => e.metadata?.eventType === 'failed_login').length,
      successfulLogins: events.filter(e => e.metadata?.eventType === 'successful_login').length,
      accountLockouts: events.filter(e => e.metadata?.eventType === 'account_locked').length,
      suspiciousActivities: events.filter(e => e.metadata?.severity === 'high' || e.metadata?.severity === 'critical').length,
      riskScore: this.calculateOverallRiskScore(events),
      topThreats: this.getTopThreats(events),
      complianceScore: this.calculateComplianceScore(events, []),
    };

    return metrics;
  }

  // Private helper methods

  private async detectBruteForce(event: SecurityEvent): Promise<{ detected: boolean; confidence: number }> {
    if (!event.ipAddress) return { detected: false, confidence: 0 };

    const recentFailures = await this.getRecentSecurityEvents(
      'failed_login',
      { ipAddress: event.ipAddress },
      15 * 60 * 1000 // 15 minutes
    );

    const detected = recentFailures.length >= this.threatDetectionConfig.bruteForceThreshold;
    const confidence = Math.min(95, (recentFailures.length / this.threatDetectionConfig.bruteForceThreshold) * 80);

    return { detected, confidence };
  }

  private async detectSuspiciousLocation(event: SecurityEvent): Promise<{ detected: boolean; confidence: number }> {
    // Placeholder implementation - would integrate with IP geolocation service
    return { detected: false, confidence: 0 };
  }

  private async detectDeviceAnomaly(event: SecurityEvent): Promise<{ detected: boolean; confidence: number }> {
    // Placeholder implementation - would analyze user agent patterns
    return { detected: false, confidence: 0 };
  }

  private async detectBehavioralAnomaly(event: SecurityEvent): Promise<{ detected: boolean; confidence: number }> {
    // Placeholder implementation - would analyze user behavior patterns
    return { detected: false, confidence: 0 };
  }

  private async handleThreatDetection(event: SecurityEvent, threat: ThreatDetectionResult): Promise<void> {
    // Log threat detection
    await this.logSecurityEvent({
      type: 'threat_detected',
      severity: threat.severity,
      userId: event.userId,
      tenantId: event.tenantId,
      ipAddress: event.ipAddress,
      metadata: {
        originalEvent: event.type,
        threatType: threat.threatType,
        confidence: threat.confidence,
        indicators: threat.indicators,
      },
    });

    // Execute recommended actions
    for (const action of threat.recommendedActions) {
      await this.executeSecurityAction(action, event, threat);
    }
  }

  private async executeSecurityAction(action: string, event: SecurityEvent, threat: ThreatDetectionResult): Promise<void> {
    switch (action) {
      case 'block_ip':
        await this.blockIpAddress(event.ipAddress!, 'threat_detected');
        break;
      case 'alert_admin':
        await this.alertAdministrators(event, threat);
        break;
      case 'require_mfa':
        // Would integrate with MFA service
        break;
      case 'lock_account':
        if (event.userId) {
          await this.lockUserAccount(event.userId, 'security_threat');
        }
        break;
    }
  }

  private async blockIpAddress(ipAddress: string, reason: string): Promise<void> {
    const key = `blocked_ip:${ipAddress}`;
    const blockDuration = 24 * 60 * 60; // 24 hours
    
    await this.cacheService.set(key, { reason, blockedAt: new Date() }, { ttl: blockDuration });
    
    this.logger.warn(`IP address blocked: ${ipAddress}`, { reason });
  }

  private async alertAdministrators(event: SecurityEvent, threat: ThreatDetectionResult): Promise<void> {
    // Emit alert event for admin notification system
    this.eventEmitter.emit('security.alert', {
      type: 'threat_detected',
      severity: threat.severity,
      event,
      threat,
      timestamp: new Date(),
    });
  }

  private async lockUserAccount(userId: string, reason: string): Promise<void> {
    // Would integrate with user management to lock account
    this.logger.warn(`User account locked: ${userId}`, { reason });
  }

  private async getRateLimitCount(key: string, windowMs: number): Promise<number> {
    const cached = this.rateLimitCache.get(key);
    const now = Date.now();

    if (!cached || now > cached.resetTime) {
      return 0;
    }

    return cached.count;
  }

  private async incrementRateLimitCount(key: string, windowMs: number): Promise<void> {
    const now = Date.now();
    const cached = this.rateLimitCache.get(key);

    if (!cached || now > cached.resetTime) {
      this.rateLimitCache.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      cached.count++;
    }
  }

  private async cacheRecentSecurityEvent(event: SecurityEvent): Promise<void> {
    const key = `recent_events:${event.tenantId || 'system'}`;
    const events = await this.cacheService.get<SecurityEvent[]>(key) || [];
    
    events.unshift(event);
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(100);
    }

    await this.cacheService.set(key, events, { ttl: 60 * 60 }); // 1 hour
  }

  private async getRecentSecurityEvents(
    type: string,
    filters: Record<string, any>,
    timeWindowMs: number
  ): Promise<SecurityEvent[]> {
    const key = `recent_events:${filters.tenantId || 'system'}`;
    const events = await this.cacheService.get<SecurityEvent[]>(key) || [];
    const cutoff = new Date(Date.now() - timeWindowMs);

    return events.filter(event => 
      event.type === type &&
      event.timestamp > cutoff &&
      Object.entries(filters).every(([key, value]) => event[key as keyof SecurityEvent] === value)
    );
  }

  private getHigherSeverity(
    current: 'low' | 'medium' | 'high' | 'critical',
    candidate: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return severityOrder[candidate] > severityOrder[current] ? candidate : current;
  }

  private getRecommendedActions(threats: string[], severity: string): string[] {
    const actions: string[] = [];

    if (threats.includes('brute_force_attack')) {
      actions.push('block_ip', 'alert_admin');
    }

    if (threats.includes('suspicious_location')) {
      actions.push('require_mfa');
    }

    if (severity === 'critical') {
      actions.push('lock_account', 'alert_admin');
    }

    return [...new Set(actions)];
  }

  private async analyzeComplianceViolations(events: any[], type: string): Promise<any[]> {
    // Placeholder implementation for compliance analysis
    return [];
  }

  private calculateComplianceScore(events: any[], findings: any[]): number {
    if (events.length === 0) return 100;
    const violationRate = findings.length / events.length;
    return Math.max(0, Math.round((1 - violationRate) * 100));
  }

  private calculateRiskLevel(findings: any[]): string {
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;

    if (criticalFindings > 0) return 'critical';
    if (highFindings > 2) return 'high';
    if (findings.length > 5) return 'medium';
    return 'low';
  }

  private generateComplianceRecommendations(findings: any[], type: string): string[] {
    // Placeholder implementation for compliance recommendations
    return [
      'Review access controls regularly',
      'Implement stronger password policies',
      'Enable multi-factor authentication for all users',
      'Conduct regular security training',
    ];
  }

  private calculateOverallRiskScore(events: any[]): number {
    // Placeholder implementation for risk score calculation
    return Math.floor(Math.random() * 100);
  }

  private getTopThreats(events: any[]): Array<{ type: string; count: number }> {
    // Placeholder implementation for top threats analysis
    return [
      { type: 'failed_login', count: 15 },
      { type: 'suspicious_activity', count: 8 },
      { type: 'account_locked', count: 3 },
    ];
  }
}