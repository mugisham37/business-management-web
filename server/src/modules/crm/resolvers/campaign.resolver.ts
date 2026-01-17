import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { CreateCampaignInput, UpdateCampaignInput, CampaignFilterInput } from '../types/campaign.input';
import { Campaign, CampaignPerformance } from '../types/campaign.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { PubSubService } from '../../../common/graphql/pubsub.service';

@Resolver(() => Campaign)
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('loyalty-campaigns')
export class CampaignResolver {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly pubSub: PubSubService,
  ) {}

  @Query(() => [Campaign])
  @RequirePermission('campaigns:read')
  async campaigns(
    @Args('filter', { type: () => CampaignFilterInput, nullable: true }) filter: CampaignFilterInput = {},
    @CurrentTenant() tenantId: string,
  ): Promise<Campaign[]> {
    return this.campaignService.getCampaigns(
      tenantId,
      filter.status,
      filter.type,
      filter.activeOnly
    );
  }

  @Query(() => Campaign)
  @RequirePermission('campaigns:read')
  async campaign(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Campaign> {
    return this.campaignService.getCampaign(tenantId, id);
  }

  @Query(() => [Campaign])
  @RequirePermission('campaigns:read')
  async activeCampaignsForCustomer(
    @CurrentTenant() tenantId: string,
    @Args('customerId', { type: () => ID }) customerId: string,
    @Args('customerTier', { nullable: true }) customerTier?: string,
    @Args('customerSegments', { type: () => [ID], nullable: true }) customerSegments?: string[],
  ): Promise<Campaign[]> {
    return this.campaignService.getActiveCampaignsForCustomer(
      tenantId,
      customerId,
      customerTier,
      customerSegments
    );
  }

  @Query(() => CampaignPerformance)
  @RequirePermission('campaigns:read')
  async campaignPerformance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CampaignPerformance> {
    return this.campaignService.getCampaignPerformance(tenantId, id);
  }

  @Mutation(() => Campaign)
  @RequirePermission('campaigns:create')
  async createCampaign(
    @Args('input') input: CreateCampaignInput,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Campaign> {
    // Convert date strings to Date objects
    const campaignData = {
      ...input,
      startDate: new Date(input.startDate as any),
      endDate: new Date(input.endDate as any),
    };
    
    const campaign = await this.campaignService.createCampaign(tenantId, campaignData as any, user.id);
    
    // Publish to subscription
    await this.pubSub.publish('campaignCreated', {
      ...campaign,
      tenantId,
    });

    return campaign;
  }

  @Mutation(() => Campaign)
  @RequirePermission('campaigns:update')
  async updateCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCampaignInput,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Campaign> {
    // Convert date strings to Date objects if provided
    const campaignData = {
      ...input,
      ...(input.startDate && { startDate: new Date(input.startDate as any) }),
      ...(input.endDate && { endDate: new Date(input.endDate as any) }),
    };
    
    const campaign = await this.campaignService.updateCampaign(tenantId, id, campaignData as any, user.id);
    
    // Publish to subscription
    await this.pubSub.publish('campaignUpdated', {
      ...campaign,
      tenantId,
    });

    return campaign;
  }

  @Mutation(() => Boolean)
  @RequirePermission('campaigns:delete')
  async deleteCampaign(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.campaignService.deleteCampaign(tenantId, id, user.id);
    
    // Publish to subscription
    this.pubSub.publish('campaignDeleted', {
      campaignDeleted: { id, tenantId },
      tenantId,
    });

    return true;
  }

  @Mutation(() => Campaign)
  @RequirePermission('campaigns:update')
  async activateCampaign(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Campaign> {
    const campaign = await this.campaignService.activateCampaign(tenantId, id, user.id);
    
    // Publish to subscription
    this.pubSub.publish('campaignActivated', {
      campaignActivated: campaign,
      tenantId,
    });

    return campaign;
  }

  @Mutation(() => Campaign)
  @RequirePermission('campaigns:update')
  async pauseCampaign(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Campaign> {
    const campaign = await this.campaignService.pauseCampaign(tenantId, id, user.id);
    
    // Publish to subscription
    this.pubSub.publish('campaignPaused', {
      campaignPaused: campaign,
      tenantId,
    });

    return campaign;
  }

  @Subscription(() => Campaign, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  campaignCreated(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSub.asyncIterator<Campaign>('campaignCreated', tenantId);
  }

  @Subscription(() => Campaign, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  campaignUpdated(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSub.asyncIterator<Campaign>('campaignUpdated', tenantId);
  }

  @Subscription(() => Campaign, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  campaignActivated(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSub.asyncIterator<Campaign>('campaignActivated', tenantId);
  }
}