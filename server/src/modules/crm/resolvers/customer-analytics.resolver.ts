import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomerAnalyticsService } from '../services/customer-analytics.service';
import {
  CustomerLifetimeValueType,
  CustomerSegmentAnalyticsType,
  PurchasePatternAnalysisType,
  ChurnPredictionType,
  CustomerJourneyType,
} from '../types/customer-analytics.types';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomerAnalyticsResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly customerAnalyticsService: CustomerAnalyticsService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => CustomerLifetimeValueType)
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getCustomerLifetimeValue(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerLifetimeValueType> {
    return this.customerAnalyticsService.calculateCustomerLifetimeValue(tenantId, customerId);
  }

  @Query(() => [CustomerSegmentAnalyticsType])
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getCustomerSegment(
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerSegmentAnalyticsType[]> {
    return this.customerAnalyticsService.getCustomerSegmentAnalytics(tenantId);
  }

  @Query(() => PurchasePatternAnalysisType)
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getPurchasePatterns(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<PurchasePatternAnalysisType> {
    return this.customerAnalyticsService.analyzePurchasePatterns(tenantId, customerId);
  }

  @Query(() => ChurnPredictionType)
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getChurnRisk(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ChurnPredictionType> {
    return this.customerAnalyticsService.predictChurnRisk(tenantId, customerId);
  }

  @Query(() => CustomerJourneyType)
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getCustomerJourney(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerJourneyType> {
    // Get comprehensive customer journey data
    const [ltv, patterns, churn] = await Promise.all([
      this.customerAnalyticsService.calculateCustomerLifetimeValue(tenantId, customerId),
      this.customerAnalyticsService.analyzePurchasePatterns(tenantId, customerId),
      this.customerAnalyticsService.predictChurnRisk(tenantId, customerId),
    ]);

    return {
      customerId,
      lifetimeValue: ltv,
      purchasePatterns: patterns,
      churnPrediction: churn,
      touchpoints: [], // Would be populated from communication history
      milestones: [], // Would be populated from customer events
    };
  }
}
