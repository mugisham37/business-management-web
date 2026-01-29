import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tenants } from '../../database/schema';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessMetricsService, BusinessMetrics } from './business-metrics.service';
import { BusinessTier, SubscriptionStatus } from '../entities/tenant.entity';

/**
 * Tier change audit log entry
 */
export interface TierChangeAuditLog {
  id: string;
  tenantId: string;
  previousTier: BusinessTier;
  newTier: BusinessTier;
  reason: string;
  triggeredBy: 'automatic' | 'manual' | 'system';
  metricsAtChange: BusinessMetrics;
  timestamp: Date;
  userId?: string;
}

/**
 * Tier evaluation result
 */
export interface TierEvaluationResult {
  currentTier: BusinessTier;
  recommendedTier: BusinessTier;
  shouldUpgrade: boolean;
  shouldDowngrade: boolean;
  confidence: number;
  reasons: string[];
  metrics: BusinessMetrics;
  thresholdsMet: number;
  totalThresholds: number;
}

/**
 * Upgrade recommendation
 */
export interface UpgradeRecommendation {
  tenantId: string;
  currentTier: BusinessTier;
  recommendedTier: BusinessTier;
  urgency: 'low' | 'medium' | 'high';
  reasons: string[];
  metrics: BusinessMetrics;
  estimatedBenefit: string[];
  recommendedActions: string[];
}

/**
 * Enhanced tier calculator with dynamic evaluation and audit logging
 */
@Injectable()
export class TierCalculatorService {
  private readonly auditLogs: Map<string, TierChangeAuditLog[]> = new Map();

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly businessMetricsService: BusinessMetricsService,
    private readonly logger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext('TierCalculatorService');
  }

  /**
   * Evaluate tier appropriateness for a tenant with real-time metrics
   */
  async evaluateTierAppropriatenessRealTime(tenantId: string): Promise<TierEvaluationResult> {
    this.logger.log(`Evaluating tier appropriateness for tenant ${tenantId}`);

    // Get current tenant data
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const currentTier = tenant.businessTier as BusinessTier;
    const currentMetrics = tenant.metrics as BusinessMetrics;

    // Calculate recommended tier based on current metrics
    const recommendedTier = this.businessMetricsService.calculateBusinessTier(currentMetrics);

    // Determine if upgrade/downgrade is needed
    const shouldUpgrade = this.getTierLevel(recommendedTier) > this.getTierLevel(currentTier);
    const shouldDowngrade = this.getTierLevel(recommendedTier) < this.getTierLevel(currentTier);

    // Calculate confidence based on how well metrics align with tier
    const confidence = this.calculateTierConfidence(currentMetrics, recommendedTier);

    // Generate reasons for the recommendation
    const reasons = this.generateTierReasons(currentMetrics, currentTier, recommendedTier);

    // Count thresholds met for current tier
    const { thresholdsMet, totalThresholds } = this.countThresholdsMet(currentMetrics, recommendedTier);

    const result: TierEvaluationResult = {
      currentTier,
      recommendedTier,
      shouldUpgrade,
      shouldDowngrade,
      confidence,
      reasons,
      metrics: currentMetrics,
      thresholdsMet,
      totalThresholds,
    };

    // Emit evaluation event
    this.eventEmitter.emit('tier.evaluation.completed', {
      tenantId,
      result,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Automatically upgrade tier when thresholds are exceeded
   */
  async processAutomaticTierUpgrade(tenantId: string, userId?: string): Promise<{
    upgraded: boolean;
    previousTier?: BusinessTier;
    newTier?: BusinessTier;
    reason?: string;
  }> {
    const evaluation = await this.evaluateTierAppropriatenessRealTime(tenantId);

    if (!evaluation.shouldUpgrade) {
      return { upgraded: false };
    }

    // Check if automatic upgrades are enabled for this tenant
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const settings = (tenant.settings || {}) as Record<string, any>;
    const autoUpgradeEnabled = settings.autoUpgradeEnabled !== false; // Default to true

    if (!autoUpgradeEnabled) {
      this.logger.log(`Automatic upgrade disabled for tenant ${tenantId}`);
      return { upgraded: false, reason: 'Automatic upgrades disabled' };
    }

    // Perform the upgrade
    await this.changeTier(
      tenantId,
      evaluation.recommendedTier,
      'automatic',
      `Metrics exceeded thresholds: ${evaluation.reasons.join(', ')}`,
      userId,
    );

    this.logger.log(`Automatically upgraded tenant ${tenantId} from ${evaluation.currentTier} to ${evaluation.recommendedTier}`);

    return {
      upgraded: true,
      previousTier: evaluation.currentTier,
      newTier: evaluation.recommendedTier,
      reason: 'Metrics exceeded tier thresholds',
    };
  }

  /**
   * Change tenant tier with comprehensive audit logging
   */
  async changeTier(
    tenantId: string,
    newTier: BusinessTier,
    triggeredBy: 'automatic' | 'manual' | 'system',
    reason: string,
    userId?: string,
  ): Promise<TierChangeAuditLog> {
    // Get current tenant data
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const previousTier = tenant.businessTier as BusinessTier;
    const currentMetrics = tenant.metrics as BusinessMetrics;

    // Create audit log entry
    const auditLog: TierChangeAuditLog = {
      id: `tier_change_${tenantId}_${Date.now()}`,
      tenantId,
      previousTier,
      newTier,
      reason,
      triggeredBy,
      metricsAtChange: currentMetrics,
      timestamp: new Date(),
      userId,
    };

    // Update tenant tier in database
    await this.drizzle.getDb()
      .update(tenants)
      .set({
        businessTier: newTier,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Store audit log
    await this.storeAuditLog(auditLog);

    // Emit tier change event
    this.eventEmitter.emit('tier.changed', {
      tenantId,
      previousTier,
      newTier,
      reason,
      triggeredBy,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Tier changed for tenant ${tenantId}: ${previousTier} -> ${newTier} (${triggeredBy})`);

    return auditLog;
  }

  /**
   * Get upgrade recommendations for tenants that exceed thresholds
   */
  async getUpgradeRecommendations(limit: number = 50): Promise<UpgradeRecommendation[]> {
    // Get all active tenants
    const tenants = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.isActive, true))
      .limit(limit);

    const recommendations: UpgradeRecommendation[] = [];

    for (const tenant of tenants) {
      try {
        const evaluation = await this.evaluateTierAppropriatenessRealTime(tenant.id);
        
        if (evaluation.shouldUpgrade) {
          const urgency = this.calculateUpgradeUrgency(evaluation);
          const estimatedBenefit = this.getEstimatedBenefits(evaluation.currentTier, evaluation.recommendedTier);
          const recommendedActions = this.businessMetricsService.getRecommendedActions(
            evaluation.metrics,
            evaluation.currentTier,
          );

          recommendations.push({
            tenantId: tenant.id,
            currentTier: evaluation.currentTier,
            recommendedTier: evaluation.recommendedTier,
            urgency,
            reasons: evaluation.reasons,
            metrics: evaluation.metrics,
            estimatedBenefit,
            recommendedActions,
          });
        }
      } catch (error) {
        this.logger.error(`Failed to evaluate tenant ${tenant.id}: ${error.message}`);
      }
    }

    // Sort by urgency (high -> medium -> low)
    recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    return recommendations;
  }

  /**
   * Get tier change audit logs for a tenant
   */
  async getTierChangeHistory(tenantId: string, limit: number = 20): Promise<TierChangeAuditLog[]> {
    const logs = this.auditLogs.get(tenantId) || [];
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Scheduled job to evaluate all tenants for tier appropriateness
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledTierEvaluation(): Promise<void> {
    this.logger.log('Starting scheduled tier evaluation for all tenants');

    try {
      const recommendations = await this.getUpgradeRecommendations(1000);
      
      this.logger.log(`Found ${recommendations.length} upgrade recommendations`);

      // Process high urgency recommendations automatically
      const highUrgencyRecommendations = recommendations.filter(r => r.urgency === 'high');
      
      for (const recommendation of highUrgencyRecommendations) {
        try {
          await this.processAutomaticTierUpgrade(recommendation.tenantId);
        } catch (error) {
          this.logger.error(`Failed to process automatic upgrade for tenant ${recommendation.tenantId}: ${error.message}`);
        }
      }

      // Emit summary event
      this.eventEmitter.emit('tier.evaluation.summary', {
        totalEvaluated: recommendations.length,
        highUrgency: highUrgencyRecommendations.length,
        mediumUrgency: recommendations.filter(r => r.urgency === 'medium').length,
        lowUrgency: recommendations.filter(r => r.urgency === 'low').length,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Scheduled tier evaluation failed: ${error.message}`);
    }
  }

  /**
   * Calculate confidence score for tier recommendation
   */
  private calculateTierConfidence(metrics: BusinessMetrics, recommendedTier: BusinessTier): number {
    const { thresholdsMet, totalThresholds } = this.countThresholdsMet(metrics, recommendedTier);
    const baseConfidence = thresholdsMet / totalThresholds;

    // Adjust confidence based on how far metrics exceed thresholds
    const tierThresholds = this.businessMetricsService['tierThresholds'][recommendedTier];
    let exceedanceBonus = 0;

    if (metrics.employeeCount > tierThresholds.employeeCount * 1.5) exceedanceBonus += 0.1;
    if (metrics.locationCount > tierThresholds.locationCount * 1.5) exceedanceBonus += 0.1;
    if (metrics.monthlyTransactionVolume > tierThresholds.monthlyTransactionVolume * 1.5) exceedanceBonus += 0.1;
    if (metrics.monthlyRevenue > tierThresholds.monthlyRevenue * 1.5) exceedanceBonus += 0.1;

    return Math.min(1.0, baseConfidence + exceedanceBonus);
  }

  /**
   * Generate reasons for tier recommendation
   */
  private generateTierReasons(
    metrics: BusinessMetrics,
    currentTier: BusinessTier,
    recommendedTier: BusinessTier,
  ): string[] {
    const reasons: string[] = [];
    const tierThresholds = this.businessMetricsService['tierThresholds'][recommendedTier];

    if (metrics.employeeCount >= tierThresholds.employeeCount) {
      reasons.push(`Employee count (${metrics.employeeCount}) meets ${recommendedTier} tier requirement`);
    }

    if (metrics.locationCount >= tierThresholds.locationCount) {
      reasons.push(`Location count (${metrics.locationCount}) meets ${recommendedTier} tier requirement`);
    }

    if (metrics.monthlyTransactionVolume >= tierThresholds.monthlyTransactionVolume) {
      reasons.push(`Transaction volume (${metrics.monthlyTransactionVolume}) meets ${recommendedTier} tier requirement`);
    }

    if (metrics.monthlyRevenue >= tierThresholds.monthlyRevenue) {
      const revenueFormatted = (metrics.monthlyRevenue / 100).toLocaleString();
      reasons.push(`Monthly revenue ($${revenueFormatted}) meets ${recommendedTier} tier requirement`);
    }

    if (currentTier !== recommendedTier) {
      const direction = this.getTierLevel(recommendedTier) > this.getTierLevel(currentTier) ? 'upgrade' : 'downgrade';
      reasons.push(`Business metrics indicate ${direction} from ${currentTier} to ${recommendedTier}`);
    }

    return reasons;
  }

  /**
   * Count how many thresholds are met for a tier
   */
  private countThresholdsMet(metrics: BusinessMetrics, tier: BusinessTier): {
    thresholdsMet: number;
    totalThresholds: number;
  } {
    const tierThresholds = this.businessMetricsService['tierThresholds'][tier];
    let thresholdsMet = 0;
    const totalThresholds = 4;

    if (metrics.employeeCount >= tierThresholds.employeeCount) thresholdsMet++;
    if (metrics.locationCount >= tierThresholds.locationCount) thresholdsMet++;
    if (metrics.monthlyTransactionVolume >= tierThresholds.monthlyTransactionVolume) thresholdsMet++;
    if (metrics.monthlyRevenue >= tierThresholds.monthlyRevenue) thresholdsMet++;

    return { thresholdsMet, totalThresholds };
  }

  /**
   * Calculate upgrade urgency based on evaluation
   */
  private calculateUpgradeUrgency(evaluation: TierEvaluationResult): 'low' | 'medium' | 'high' {
    const { confidence, thresholdsMet, totalThresholds } = evaluation;

    // High urgency: High confidence and most thresholds met
    if (confidence >= 0.8 && thresholdsMet >= 3) {
      return 'high';
    }

    // Medium urgency: Moderate confidence or some thresholds met
    if (confidence >= 0.6 || thresholdsMet >= 2) {
      return 'medium';
    }

    // Low urgency: Lower confidence or few thresholds met
    return 'low';
  }

  /**
   * Get estimated benefits of upgrading to a higher tier
   */
  private getEstimatedBenefits(currentTier: BusinessTier, targetTier: BusinessTier): string[] {
    const currentBenefits = this.businessMetricsService.getTierBenefits(currentTier);
    const targetBenefits = this.businessMetricsService.getTierBenefits(targetTier);

    // Find features that are in target but not in current
    const newFeatures = targetBenefits.features.filter(
      feature => !currentBenefits.features.includes(feature)
    );

    const benefits = [
      ...newFeatures.map(feature => `Access to ${feature}`),
      'Increased usage limits',
      'Enhanced support level',
    ];

    // Add tier-specific benefits
    if (targetTier === BusinessTier.MEDIUM) {
      benefits.push('Multi-location management', 'Advanced analytics');
    } else if (targetTier === BusinessTier.ENTERPRISE) {
      benefits.push('Custom integrations', 'Dedicated account manager', 'White-label options');
    }

    return benefits;
  }

  /**
   * Get tier level for comparison
   */
  private getTierLevel(tier: BusinessTier): number {
    const levels: Record<BusinessTier, number> = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 1,
      [BusinessTier.MEDIUM]: 2,
      [BusinessTier.ENTERPRISE]: 3,
    };
    return levels[tier] || 0;
  }

  /**
   * Store audit log (in production, this would go to a database)
   */
  private async storeAuditLog(auditLog: TierChangeAuditLog): Promise<void> {
    const tenantLogs = this.auditLogs.get(auditLog.tenantId) || [];
    tenantLogs.push(auditLog);
    this.auditLogs.set(auditLog.tenantId, tenantLogs);

    // In production, store in database
    this.logger.log(`Audit log stored: ${auditLog.id}`);
  }
}