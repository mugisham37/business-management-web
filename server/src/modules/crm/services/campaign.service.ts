import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '../../database/drizzle.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { loyaltyCampaigns, loyaltyTransactions, customers } from '../../database/schema';
import { eq, and, gte, lte, desc, isNull, sql } from 'drizzle-orm';

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'loyalty_points' | 'discount' | 'promotion' | 'referral';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  pointsMultiplier?: number;
  minimumPurchaseAmount?: number;
  targetSegments: string[];
  targetTiers: string[];
  applicableCategories: string[];
  applicableProducts: string[];
  maxPointsPerCustomer?: number;
  totalPointsBudget?: number;
  pointsAwarded: number;
  participantCount: number;
  conversionRate: number;
  termsAndConditions?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  type: 'loyalty_points' | 'discount' | 'promotion' | 'referral';
  startDate: Date;
  endDate: Date;
  pointsMultiplier?: number;
  minimumPurchaseAmount?: number;
  targetSegments?: string[];
  targetTiers?: string[];
  applicableCategories?: string[];
  applicableProducts?: string[];
  maxPointsPerCustomer?: number;
  totalPointsBudget?: number;
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  pointsMultiplier?: number;
  minimumPurchaseAmount?: number;
  targetSegments?: string[];
  targetTiers?: string[];
  applicableCategories?: string[];
  applicableProducts?: string[];
  maxPointsPerCustomer?: number;
  totalPointsBudget?: number;
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly cacheService: IntelligentCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getCampaign(tenantId: string, id: string): Promise<Campaign> {
    try {
      const cacheKey = `campaign:${tenantId}:${id}`;
      
      let campaign = await this.cacheService.get<Campaign>(cacheKey);
      
      if (!campaign) {
        const [campaignData] = await this.drizzle.getDb()
          .select()
          .from(loyaltyCampaigns)
          .where(and(
            eq(loyaltyCampaigns.tenantId, tenantId),
            eq(loyaltyCampaigns.id, id),
            isNull(loyaltyCampaigns.deletedAt)
          ));

        if (!campaignData) {
          throw new NotFoundException(`Campaign ${id} not found`);
        }

        campaign = this.mapToEntity(campaignData);

        // Cache for 10 minutes
        await this.cacheService.set(cacheKey, campaign, { ttl: 600, tenantId });
      }

      return campaign;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get campaign ${id}:`, error);
      throw error;
    }
  }

  async getCampaigns(
    tenantId: string, 
    status?: string,
    type?: string,
    isActive?: boolean
  ): Promise<Campaign[]> {
    try {
      const cacheKey = `campaigns:${tenantId}:${status}:${type}:${isActive}`;
      
      let campaigns = await this.cacheService.get<Campaign[]>(cacheKey);
      
      if (!campaigns) {
        const conditions = [
          eq(loyaltyCampaigns.tenantId, tenantId),
          isNull(loyaltyCampaigns.deletedAt)
        ];

        if (status) {
          conditions.push(eq(loyaltyCampaigns.status, status));
        }

        // Note: 'type' parameter is accepted but not used since the schema doesn't have a type column
        // Type information is stored in metadata or handled at the application level

        if (isActive) {
          const now = new Date();
          conditions.push(
            and(
              eq(loyaltyCampaigns.status, 'active'),
              lte(loyaltyCampaigns.startDate, now),
              gte(loyaltyCampaigns.endDate, now)
            ) as any
          );
        }

        const campaignData = await this.drizzle.getDb()
          .select()
          .from(loyaltyCampaigns)
          .where(and(...conditions))
          .orderBy(desc(loyaltyCampaigns.createdAt));

        campaigns = campaignData.map(c => this.mapToEntity(c));

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, campaigns, { ttl: 300, tenantId });
      }

      return campaigns;
    } catch (error) {
      this.logger.error(`Failed to get campaigns for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async createCampaign(tenantId: string, data: CreateCampaignDto, userId: string): Promise<Campaign> {
    try {
      // Validate campaign dates
      if (data.endDate <= data.startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      const campaignData = {
        tenantId,
        name: data.name,
        description: data.description,
        status: 'draft' as const,
        startDate: data.startDate,
        endDate: data.endDate,
        pointsMultiplier: (data.pointsMultiplier ?? 1).toString(),
        minimumPurchaseAmount: data.minimumPurchaseAmount ? data.minimumPurchaseAmount.toString() : undefined,
        targetSegments: data.targetSegments || [],
        targetTiers: data.targetTiers || [],
        applicableCategories: data.applicableCategories || [],
        applicableProducts: data.applicableProducts || [],
        maxPointsPerCustomer: data.maxPointsPerCustomer,
        totalPointsBudget: data.totalPointsBudget,
        termsAndConditions: data.termsAndConditions,
        metadata: {
          ...data.metadata,
          type: data.type, // Store type in metadata since schema doesn't have type column
        },
        createdBy: userId,
        updatedBy: userId,
      };

      const [createdCampaign] = await this.drizzle.getDb()
        .insert(loyaltyCampaigns)
        .values(campaignData)
        .returning();

      const campaign = this.mapToEntity(createdCampaign);

      // Clear caches
      await this.invalidateCampaignCaches(tenantId);

      // Emit event
      this.eventEmitter.emit('campaign.created', {
        tenantId,
        campaignId: campaign.id,
        campaign,
        userId,
      });

      this.logger.log(`Created campaign ${campaign.id} for tenant ${tenantId}`);
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to create campaign:`, error);
      throw error;
    }
  }

  async updateCampaign(
    tenantId: string,
    id: string,
    data: UpdateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    try {
      const existing = await this.getCampaign(tenantId, id);

      // Validate status transitions
      if (data.status && !this.isValidStatusTransition(existing.status, data.status)) {
        throw new BadRequestException(`Cannot transition from ${existing.status} to ${data.status}`);
      }

      const updateData: any = {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      };

      // Convert numeric fields to strings for decimal columns
      if (data.pointsMultiplier !== undefined) {
        updateData.pointsMultiplier = data.pointsMultiplier.toString();
      }
      if (data.minimumPurchaseAmount !== undefined) {
        updateData.minimumPurchaseAmount = data.minimumPurchaseAmount.toString();
      }

      const [updatedCampaign] = await this.drizzle.getDb()
        .update(loyaltyCampaigns)
        .set(updateData)
        .where(and(
          eq(loyaltyCampaigns.tenantId, tenantId),
          eq(loyaltyCampaigns.id, id)
        ))
        .returning();

      const campaign = this.mapToEntity(updatedCampaign);

      // Clear caches
      await this.invalidateCampaignCaches(tenantId, id);

      // Emit event
      this.eventEmitter.emit('campaign.updated', {
        tenantId,
        campaignId: id,
        campaign,
        previousData: existing,
        userId,
      });

      this.logger.log(`Updated campaign ${id}`);
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to update campaign ${id}:`, error);
      throw error;
    }
  }

  async deleteCampaign(tenantId: string, id: string, userId: string): Promise<void> {
    try {
      const campaign = await this.getCampaign(tenantId, id);

      // Can only delete draft campaigns
      if (campaign.status !== 'draft') {
        throw new BadRequestException('Can only delete draft campaigns');
      }

      await this.drizzle.getDb()
        .update(loyaltyCampaigns)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
        })
        .where(and(
          eq(loyaltyCampaigns.tenantId, tenantId),
          eq(loyaltyCampaigns.id, id)
        ));

      // Clear caches
      await this.invalidateCampaignCaches(tenantId, id);

      // Emit event
      this.eventEmitter.emit('campaign.deleted', {
        tenantId,
        campaignId: id,
        campaign,
        userId,
      });

      this.logger.log(`Deleted campaign ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete campaign ${id}:`, error);
      throw error;
    }
  }

  async activateCampaign(tenantId: string, id: string, userId: string): Promise<Campaign> {
    try {
      return await this.updateCampaign(tenantId, id, { status: 'active' }, userId);
    } catch (error) {
      this.logger.error(`Failed to activate campaign ${id}:`, error);
      throw error;
    }
  }

  async pauseCampaign(tenantId: string, id: string, userId: string): Promise<Campaign> {
    try {
      return await this.updateCampaign(tenantId, id, { status: 'paused' }, userId);
    } catch (error) {
      this.logger.error(`Failed to pause campaign ${id}:`, error);
      throw error;
    }
  }

  async getCampaignPerformance(tenantId: string, id: string): Promise<any> {
    try {
      const campaign = await this.getCampaign(tenantId, id);

      // Get campaign statistics
      const stats = await this.drizzle.getDb()
        .select({
          totalPoints: sql<number>`COALESCE(SUM(${loyaltyTransactions.points}), 0)`,
          participantCount: sql<number>`COUNT(DISTINCT ${loyaltyTransactions.customerId})`,
        })
        .from(loyaltyTransactions)
        .where(and(
          eq(loyaltyTransactions.tenantId, tenantId),
          eq(loyaltyTransactions.campaignId, id)
        ));

      const performance = stats?.[0];

      return {
        campaignId: id,
        campaignName: campaign.name,
        status: campaign.status,
        pointsAwarded: performance ? Number(performance.totalPoints) || 0 : 0,
        participantCount: performance ? Number(performance.participantCount) || 0 : 0,
        conversionRate: campaign.conversionRate,
        budgetUtilization: campaign.totalPointsBudget && performance
          ? (Number(performance.totalPoints) / campaign.totalPointsBudget) * 100 
          : 0,
        daysRemaining: Math.max(0, Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      };
    } catch (error) {
      this.logger.error(`Failed to get campaign performance for ${id}:`, error);
      throw error;
    }
  }

  async getActiveCampaignsForCustomer(
    tenantId: string, 
    customerId: string,
    customerTier?: string,
    customerSegments?: string[]
  ): Promise<Campaign[]> {
    try {
      const now = new Date();
      const activeCampaigns = await this.getCampaigns(tenantId, 'active');

      // Filter campaigns based on customer eligibility
      return activeCampaigns.filter(campaign => {
        // Check date range
        if (campaign.startDate > now || campaign.endDate < now) {
          return false;
        }

        // Check tier targeting
        if (campaign.targetTiers.length > 0 && customerTier) {
          if (!campaign.targetTiers.includes(customerTier)) {
            return false;
          }
        }

        // Check segment targeting
        if (campaign.targetSegments.length > 0 && customerSegments) {
          const hasMatchingSegment = campaign.targetSegments.some(segmentId => 
            customerSegments.includes(segmentId)
          );
          if (!hasMatchingSegment) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      this.logger.error(`Failed to get active campaigns for customer ${customerId}:`, error);
      throw error;
    }
  }

  private mapToEntity(data: any): Campaign {
    return {
      id: data.id,
      tenantId: data.tenantId,
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      pointsMultiplier: data.pointsMultiplier,
      minimumPurchaseAmount: data.minimumPurchaseAmount,
      targetSegments: data.targetSegments || [],
      targetTiers: data.targetTiers || [],
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      maxPointsPerCustomer: data.maxPointsPerCustomer,
      totalPointsBudget: data.totalPointsBudget,
      pointsAwarded: data.pointsAwarded || 0,
      participantCount: data.participantCount || 0,
      conversionRate: data.conversionRate || 0,
      termsAndConditions: data.termsAndConditions,
      metadata: data.metadata || {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    };
  }

  private isValidStatusTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      draft: ['active', 'cancelled'],
      active: ['paused', 'completed', 'cancelled'],
      paused: ['active', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    return validTransitions[from]?.includes(to) || false;
  }

  private async invalidateCampaignCaches(tenantId: string, campaignId?: string): Promise<void> {
    try {
      await this.cacheService.invalidatePattern(`campaigns:${tenantId}:*`);
      
      if (campaignId) {
        await this.cacheService.invalidatePattern(`campaign:${tenantId}:${campaignId}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate campaign caches:`, error);
    }
  }
}