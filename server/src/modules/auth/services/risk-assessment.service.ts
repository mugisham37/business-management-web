import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../../database/drizzle.service';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { 
  RiskAssessment, 
  RiskFactor, 
  DeviceFingerprint,
  GeoLocation,
} from '../interfaces/auth.interface';
import { users, userSessions } from '../../database/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export interface LoginRiskContext {
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: DeviceFingerprint;
  loginTime: Date;
  mfaUsed?: boolean;
  userHistory: {
    lastLoginAt?: Date;
    lastLoginIp?: string;
    failedAttempts: number;
  };
}

export interface TokenRefreshRiskContext {
  userId: string;
  tenantId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: Date;
}

@Injectable()
export class RiskAssessmentService {
  private readonly riskConfig: {
    enabled: boolean;
    factors: {
      location: { weight: number; enabled: boolean };
      device: { weight: number; enabled: boolean };
      behavior: { weight: number; enabled: boolean };
      network: { weight: number; enabled: boolean };
      time: { weight: number; enabled: boolean };
    };
    thresholds: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
  ) {
    this.riskConfig = {
      enabled: this.configService.get<boolean>('RISK_ASSESSMENT_ENABLED', true),
      factors: {
        location: {
          weight: this.configService.get<number>('RISK_LOCATION_WEIGHT', 0.2),
          enabled: this.configService.get<boolean>('RISK_LOCATION_ENABLED', true),
        },
        device: {
          weight: this.configService.get<number>('RISK_DEVICE_WEIGHT', 0.25),
          enabled: this.configService.get<boolean>('RISK_DEVICE_ENABLED', true),
        },
        behavior: {
          weight: this.configService.get<number>('RISK_BEHAVIOR_WEIGHT', 0.3),
          enabled: this.configService.get<boolean>('RISK_BEHAVIOR_ENABLED', true),
        },
        network: {
          weight: this.configService.get<number>('RISK_NETWORK_WEIGHT', 0.15),
          enabled: this.configService.get<boolean>('RISK_NETWORK_ENABLED', true),
        },
        time: {
          weight: this.configService.get<number>('RISK_TIME_WEIGHT', 0.1),
          enabled: this.configService.get<boolean>('RISK_TIME_ENABLED', true),
        },
      },
      thresholds: {
        low: this.configService.get<number>('RISK_THRESHOLD_LOW', 25),
        medium: this.configService.get<number>('RISK_THRESHOLD_MEDIUM', 50),
        high: this.configService.get<number>('RISK_THRESHOLD_HIGH', 75),
        critical: this.configService.get<number>('RISK_THRESHOLD_CRITICAL', 90),
      },
    };

    this.logger.setContext('RiskAssessmentService');
  }

  /**
   * Assess login risk based on multiple factors
   */
  async assessLoginRisk(context: LoginRiskContext): Promise<RiskAssessment> {
    if (!this.riskConfig.enabled) {
      return this.createLowRiskAssessment();
    }

    try {
      const factors = await this.calculateRiskFactors(context);
      const score = this.calculateOverallRiskScore(factors);
      const level = this.determineRiskLevel(score);
      const recommendations = this.generateRecommendations(factors, level);
      const requiredActions = this.determineRequiredActions(factors, level);

      const assessment: RiskAssessment = {
        score,
        level,
        factors,
        recommendations,
        requiredActions,
        timestamp: new Date(),
      };

      // Cache the assessment for future reference
      await this.cacheRiskAssessment(context.userId, assessment);

      this.logger.log(`Risk assessment completed for user ${context.userId}`, {
        score,
        level,
        factors: Object.keys(factors).reduce((acc, key) => {
          acc[key] = factors[key as keyof typeof factors].score;
          return acc;
        }, {} as Record<string, number>),
      });

      return assessment;
    } catch (error) {
      this.logger.error('Risk assessment failed', {
        userId: context.userId,
        error: error.message,
      });
      
      // Return medium risk on error to be safe
      return this.createMediumRiskAssessment();
    }
  }

  /**
   * Assess token refresh risk
   */
  async assessTokenRefreshRisk(context: TokenRefreshRiskContext): Promise<RiskAssessment> {
    if (!this.riskConfig.enabled) {
      return this.createLowRiskAssessment();
    }

    try {
      // Get session information
      const db = this.drizzleService.getDb();
      const [session] = await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.id, context.sessionId))
        .limit(1);

      if (!session) {
        return this.createHighRiskAssessment('Session not found');
      }

      // Check for session anomalies
      const sessionRisk = await this.assessSessionRisk(session, context);
      const networkRisk = await this.assessNetworkRisk(context.ipAddress);
      const timeRisk = await this.assessTimeRisk(new Date());

      const factors: RiskAssessment['factors'] = {
        location: { score: 0, weight: 0, details: {}, enabled: false },
        device: { score: sessionRisk.deviceScore, weight: this.riskConfig.factors.device.weight, details: sessionRisk.deviceDetails, enabled: this.riskConfig.factors.device.enabled },
        behavior: { score: sessionRisk.behaviorScore, weight: this.riskConfig.factors.behavior.weight, details: sessionRisk.behaviorDetails, enabled: this.riskConfig.factors.behavior.enabled },
        network: { score: networkRisk.score, weight: this.riskConfig.factors.network.weight, details: networkRisk.details, enabled: this.riskConfig.factors.network.enabled },
        time: { score: timeRisk.score, weight: this.riskConfig.factors.time.weight, details: timeRisk.details, enabled: this.riskConfig.factors.time.enabled },
      };

      const score = this.calculateOverallRiskScore(factors);
      const level = this.determineRiskLevel(score);

      return {
        score,
        level,
        factors,
        recommendations: this.generateRecommendations(factors, level),
        requiredActions: this.determineRequiredActions(factors, level),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Token refresh risk assessment failed', {
        userId: context.userId,
        sessionId: context.sessionId,
        error: error.message,
      });
      
      return this.createMediumRiskAssessment();
    }
  }

  /**
   * Get user's risk history
   */
  async getUserRiskHistory(userId: string, days: number = 30): Promise<RiskAssessment[]> {
    const key = `risk_history:${userId}`;
    const history = await this.cacheService.get<RiskAssessment[]>(key) || [];
    
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return history.filter(assessment => assessment.timestamp > cutoff);
  }

  /**
   * Update user's risk profile based on behavior
   */
  async updateUserRiskProfile(userId: string, behaviorData: Record<string, any>): Promise<void> {
    const key = `risk_profile:${userId}`;
    const profile = await this.cacheService.get<Record<string, any>>(key) || {};
    
    // Update profile with new behavior data
    profile.lastUpdate = new Date();
    profile.behaviorData = { ...profile.behaviorData, ...behaviorData };
    
    await this.cacheService.set(key, profile, 30 * 24 * 60 * 60); // 30 days
  }

  // Private helper methods

  private async calculateRiskFactors(context: LoginRiskContext): Promise<RiskAssessment['factors']> {
    const factors: RiskAssessment['factors'] = {
      location: await this.assessLocationRisk(context.ipAddress, context.userId),
      device: await this.assessDeviceRisk(context.deviceFingerprint, context.userId),
      behavior: await this.assessBehaviorRisk(context),
      network: await this.assessNetworkRisk(context.ipAddress),
      time: await this.assessTimeRisk(context.loginTime),
    };

    return factors;
  }

  private async assessLocationRisk(ipAddress?: string, userId?: string): Promise<RiskFactor> {
    if (!this.riskConfig.factors.location.enabled || !ipAddress) {
      return { score: 0, weight: 0, details: {}, enabled: false };
    }

    try {
      // Get location from IP (would integrate with IP geolocation service)
      const location = await this.getLocationFromIP(ipAddress);
      
      // Get user's historical locations
      const historicalLocations = await this.getUserHistoricalLocations(userId!);
      
      // Calculate risk based on location familiarity
      const isKnownLocation = historicalLocations.some(loc => 
        this.calculateLocationDistance(location, loc) < 100 // 100km threshold
      );

      const score = isKnownLocation ? 10 : 70;
      
      return {
        score,
        weight: this.riskConfig.factors.location.weight,
        details: {
          currentLocation: location,
          isKnownLocation,
          historicalLocationCount: historicalLocations.length,
        },
        enabled: true,
      };
    } catch (error) {
      this.logger.warn('Location risk assessment failed', { error: error.message });
      return { score: 30, weight: this.riskConfig.factors.location.weight, details: { error: 'location_unavailable' }, enabled: true };
    }
  }

  private async assessDeviceRisk(deviceFingerprint?: DeviceFingerprint, userId?: string): Promise<RiskFactor> {
    if (!this.riskConfig.factors.device.enabled || !deviceFingerprint) {
      return { score: 50, weight: this.riskConfig.factors.device.weight, details: { reason: 'no_device_fingerprint' }, enabled: true };
    }

    try {
      // Check if device is known
      const knownDevices = await this.getUserKnownDevices(userId!);
      const isKnownDevice = knownDevices.some(device => device.hash === deviceFingerprint.hash);
      
      // Calculate device trust score
      const trustScore = deviceFingerprint.trustScore || 0;
      const ageScore = this.calculateDeviceAgeScore(deviceFingerprint);
      
      // Combine factors
      let score = 50; // baseline
      
      if (isKnownDevice) {
        score -= 30; // reduce risk for known devices
      } else {
        score += 20; // increase risk for unknown devices
      }
      
      score -= (trustScore / 100) * 30; // adjust based on trust score
      score -= ageScore; // adjust based on device age
      
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        weight: this.riskConfig.factors.device.weight,
        details: {
          isKnownDevice,
          trustScore,
          ageScore,
          deviceHash: deviceFingerprint.hash,
        },
        enabled: true,
      };
    } catch (error) {
      this.logger.warn('Device risk assessment failed', { error: error.message });
      return { score: 60, weight: this.riskConfig.factors.device.weight, details: { error: 'device_assessment_failed' }, enabled: true };
    }
  }

  private async assessBehaviorRisk(context: LoginRiskContext): Promise<RiskFactor> {
    if (!this.riskConfig.factors.behavior.enabled) {
      return { score: 0, weight: 0, details: {}, enabled: false };
    }

    try {
      const behaviorProfile = await this.getUserBehaviorProfile(context.userId);
      
      // Analyze login patterns
      const timePattern = this.analyzeLoginTimePattern(context.loginTime, behaviorProfile.loginTimes || []);
      const frequencyPattern = this.analyzeLoginFrequency(context.loginTime, behaviorProfile.lastLogins || []);
      const failurePattern = this.analyzeFailurePattern(context.userHistory.failedAttempts, behaviorProfile.averageFailures || 0);
      
      // Calculate behavior score
      let score = 20; // baseline
      score += timePattern.riskScore;
      score += frequencyPattern.riskScore;
      score += failurePattern.riskScore;
      
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        weight: this.riskConfig.factors.behavior.weight,
        details: {
          timePattern,
          frequencyPattern,
          failurePattern,
        },
        enabled: true,
      };
    } catch (error) {
      this.logger.warn('Behavior risk assessment failed', { error: error.message });
      return { score: 40, weight: this.riskConfig.factors.behavior.weight, details: { error: 'behavior_assessment_failed' }, enabled: true };
    }
  }

  private async assessNetworkRisk(ipAddress?: string): Promise<RiskFactor> {
    if (!this.riskConfig.factors.network.enabled || !ipAddress) {
      return { score: 30, weight: this.riskConfig.factors.network.weight, details: { reason: 'no_ip_address' }, enabled: true };
    }

    try {
      // Check if IP is in trusted networks
      const trustedNetworks = this.configService.get<string[]>('TRUSTED_NETWORKS', []);
      const isTrustedNetwork = trustedNetworks.some(network => this.isIPInNetwork(ipAddress, network));
      
      // Check IP reputation (would integrate with threat intelligence service)
      const ipReputation = await this.getIPReputation(ipAddress);
      
      // Calculate network risk
      let score = 40; // baseline
      
      if (isTrustedNetwork) {
        score -= 30;
      }
      
      if (ipReputation.isMalicious) {
        score += 50;
      } else if (ipReputation.isProxy || ipReputation.isVPN) {
        score += 20;
      }
      
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        weight: this.riskConfig.factors.network.weight,
        details: {
          isTrustedNetwork,
          ipReputation,
          ipAddress,
        },
        enabled: true,
      };
    } catch (error) {
      this.logger.warn('Network risk assessment failed', { error: error.message });
      return { score: 50, weight: this.riskConfig.factors.network.weight, details: { error: 'network_assessment_failed' }, enabled: true };
    }
  }

  private async assessTimeRisk(loginTime: Date): Promise<RiskFactor> {
    if (!this.riskConfig.factors.time.enabled) {
      return { score: 0, weight: 0, details: {}, enabled: false };
    }

    try {
      const hour = loginTime.getHours();
      const dayOfWeek = loginTime.getDay();
      
      // Define business hours (9 AM - 5 PM, Monday-Friday)
      const isBusinessHours = hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isNightTime = hour < 6 || hour > 22;
      
      let score = 10; // baseline low risk
      
      if (isNightTime) {
        score += 20;
      }
      
      if (isWeekend) {
        score += 10;
      }
      
      if (!isBusinessHours) {
        score += 15;
      }
      
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        weight: this.riskConfig.factors.time.weight,
        details: {
          hour,
          dayOfWeek,
          isBusinessHours,
          isWeekend,
          isNightTime,
        },
        enabled: true,
      };
    } catch (error) {
      this.logger.warn('Time risk assessment failed', { error: error.message });
      return { score: 20, weight: this.riskConfig.factors.time.weight, details: { error: 'time_assessment_failed' }, enabled: true };
    }
  }

  private calculateOverallRiskScore(factors: RiskAssessment['factors']): number {
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(factors).forEach(factor => {
      if (factor.enabled) {
        totalScore += factor.score * factor.weight;
        totalWeight += factor.weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.riskConfig.thresholds.critical) return 'critical';
    if (score >= this.riskConfig.thresholds.high) return 'high';
    if (score >= this.riskConfig.thresholds.medium) return 'medium';
    return 'low';
  }

  private generateRecommendations(factors: RiskAssessment['factors'], level: string): string[] {
    const recommendations: string[] = [];

    if (factors.location.enabled && factors.location.score > 50) {
      recommendations.push('Verify login from new location');
    }

    if (factors.device.enabled && factors.device.score > 60) {
      recommendations.push('Verify device identity');
    }

    if (factors.behavior.enabled && factors.behavior.score > 70) {
      recommendations.push('Review unusual behavior patterns');
    }

    if (factors.network.enabled && factors.network.score > 60) {
      recommendations.push('Verify network security');
    }

    if (level === 'high' || level === 'critical') {
      recommendations.push('Require additional authentication');
      recommendations.push('Monitor session closely');
    }

    return recommendations;
  }

  private determineRequiredActions(factors: RiskAssessment['factors'], level: string): string[] {
    const actions: string[] = [];

    if (level === 'medium') {
      actions.push('require_mfa');
    }

    if (level === 'high') {
      actions.push('require_mfa');
      actions.push('require_approval');
    }

    if (level === 'critical') {
      actions.push('block_access');
      actions.push('alert_admin');
    }

    if (factors.network.enabled && factors.network.score > 80) {
      actions.push('block_ip');
    }

    return [...new Set(actions)];
  }

  private async cacheRiskAssessment(userId: string, assessment: RiskAssessment): Promise<void> {
    const key = `risk_history:${userId}`;
    const history = await this.cacheService.get<RiskAssessment[]>(key) || [];
    
    history.unshift(assessment);
    // Keep only last 50 assessments
    if (history.length > 50) {
      history.splice(50);
    }

    await this.cacheService.set(key, history, 30 * 24 * 60 * 60); // 30 days
  }

  private createLowRiskAssessment(): RiskAssessment {
    return {
      score: 10,
      level: 'low',
      factors: {
        location: { score: 0, weight: 0, details: {}, enabled: false },
        device: { score: 0, weight: 0, details: {}, enabled: false },
        behavior: { score: 0, weight: 0, details: {}, enabled: false },
        network: { score: 0, weight: 0, details: {}, enabled: false },
        time: { score: 0, weight: 0, details: {}, enabled: false },
      },
      recommendations: [],
      requiredActions: [],
      timestamp: new Date(),
    };
  }

  private createMediumRiskAssessment(): RiskAssessment {
    return {
      score: 50,
      level: 'medium',
      factors: {
        location: { score: 50, weight: 0.2, details: { reason: 'assessment_error' }, enabled: true },
        device: { score: 50, weight: 0.25, details: { reason: 'assessment_error' }, enabled: true },
        behavior: { score: 50, weight: 0.3, details: { reason: 'assessment_error' }, enabled: true },
        network: { score: 50, weight: 0.15, details: { reason: 'assessment_error' }, enabled: true },
        time: { score: 50, weight: 0.1, details: { reason: 'assessment_error' }, enabled: true },
      },
      recommendations: ['Review login attempt manually'],
      requiredActions: ['require_mfa'],
      timestamp: new Date(),
    };
  }

  private createHighRiskAssessment(reason: string): RiskAssessment {
    return {
      score: 80,
      level: 'high',
      factors: {
        location: { score: 80, weight: 0.2, details: { reason }, enabled: true },
        device: { score: 80, weight: 0.25, details: { reason }, enabled: true },
        behavior: { score: 80, weight: 0.3, details: { reason }, enabled: true },
        network: { score: 80, weight: 0.15, details: { reason }, enabled: true },
        time: { score: 80, weight: 0.1, details: { reason }, enabled: true },
      },
      recommendations: ['Block access', 'Alert administrators'],
      requiredActions: ['block_access', 'alert_admin'],
      timestamp: new Date(),
    };
  }

  // Placeholder implementations for external service integrations

  private async getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
    // Would integrate with IP geolocation service
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  private async getUserHistoricalLocations(userId: string): Promise<GeoLocation[]> {
    // Would fetch from user's login history
    return [];
  }

  private calculateLocationDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    // Would calculate distance between two locations
    return 0;
  }

  private async getUserKnownDevices(userId: string): Promise<DeviceFingerprint[]> {
    // Would fetch from user's device history
    return [];
  }

  private calculateDeviceAgeScore(device: DeviceFingerprint): number {
    const daysSinceFirstSeen = Math.floor((Date.now() - device.firstSeen.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(20, daysSinceFirstSeen * 2); // Max 20 points for device age
  }

  private async getUserBehaviorProfile(userId: string): Promise<Record<string, any>> {
    const key = `behavior_profile:${userId}`;
    return await this.cacheService.get<Record<string, any>>(key) || {};
  }

  private analyzeLoginTimePattern(currentTime: Date, historicalTimes: Date[]): { riskScore: number; details: any } {
    // Would analyze if current login time matches user's typical patterns
    return { riskScore: 10, details: { typical: true } };
  }

  private analyzeLoginFrequency(currentTime: Date, lastLogins: Date[]): { riskScore: number; details: any } {
    // Would analyze login frequency patterns
    return { riskScore: 5, details: { normal: true } };
  }

  private analyzeFailurePattern(currentFailures: number, averageFailures: number): { riskScore: number; details: any } {
    const riskScore = currentFailures > averageFailures * 2 ? 30 : 0;
    return { riskScore, details: { currentFailures, averageFailures } };
  }

  private isIPInNetwork(ip: string, network: string): boolean {
    // Would check if IP is in CIDR network
    return false;
  }

  private async getIPReputation(ipAddress: string): Promise<{ isMalicious: boolean; isProxy: boolean; isVPN: boolean }> {
    // Would integrate with threat intelligence service
    return { isMalicious: false, isProxy: false, isVPN: false };
  }

  private async assessSessionRisk(session: any, context: TokenRefreshRiskContext): Promise<{
    deviceScore: number;
    deviceDetails: any;
    behaviorScore: number;
    behaviorDetails: any;
  }> {
    // Analyze session for anomalies
    const timeSinceLastAccess = Date.now() - (session.lastAccessedAt?.getTime() || Date.now());
    const deviceScore = timeSinceLastAccess > 24 * 60 * 60 * 1000 ? 40 : 10; // Higher risk if inactive for >24h
    
    return {
      deviceScore,
      deviceDetails: { timeSinceLastAccess },
      behaviorScore: 20,
      behaviorDetails: { sessionAge: Date.now() - session.createdAt.getTime() },
    };
  }
}