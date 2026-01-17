import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomerAnalyticsService } from '../services/customer-analytics.service';
import { SegmentationService } from '../services/segmentation.service';
import {
  CustomerLifetimeValue,
  SegmentAnalytics,
  PurchasePattern,
  ChurnRiskAnalysis,
  CustomerMetrics,
} from '../types/customer-analytics.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver(() => CustomerLifetimeValue)
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('customer-analytics')
export class CustomerAnalyticsResolver {
  constructor(
    private readonly customerAnalyticsService: CustomerAnalyticsService,
    private readonly segmentationService: SegmentationService,
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => CustomerLifetimeValue)
  @RequirePermission('analytics:read')
  async customerLifetimeValue(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerLifetimeValue> {
    return this.customerAnalyticsService.calculateCustomerLifetimeValue(tenantId, customerId);
  }

  @Query(() => [CustomerLifetimeValue])
  @RequirePermission('analytics:read')
  async customersLifetimeValue(
    @Args('customerIds', { type: () => [ID] }) customerIds: string[],
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerLifetimeValue[]> {
    return Promise.all(
      customerIds.map(customerId => 
        this.customerAnalyticsService.calculateCustomerLifetimeValue(tenantId, customerId)
      )
    );
  }

  @Query(() => SegmentAnalytics)
  @RequirePermission('analytics:read')
  async segmentAnalytics(
    @Args('segmentId', { type: () => ID }) segmentId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentAnalytics> {
    return this.customerAnalyticsService.getCustomerSegmentAnalytics(tenantId, segmentId);
  }

  @Query(() => [SegmentAnalytics])
  @RequirePermission('analytics:read')
  async allSegmentsAnalytics(
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentAnalytics[]> {
    const segments = await this.segmentationService.getSegments(tenantId, true);
    return Promise.all(
      segments.map(segment => 
        this.customerAnalyticsService.getCustomerSegmentAnalytics(tenantId, segment.id)
      )
    );
  }

  @Query(() => PurchasePattern)
  @RequirePermission('analytics:read')
  async customerPurchasePatterns(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<PurchasePattern> {
    return this.customerAnalyticsService.analyzePurchasePatterns(tenantId, customerId);
  }

  @Query(() => [PurchasePattern])
  @RequirePermission('analytics:read')
  async customersPurchasePatterns(
    @Args('customerIds', { type: () => [ID] }) customerIds: string[],
    @CurrentTenant() tenantId: string,
  ): Promise<PurchasePattern[]> {
    return Promise.all(
      customerIds.map(customerId => 
        this.customerAnalyticsService.analyzePurchasePatterns(tenantId, customerId)
      )
    );
  }

  @Query(() => ChurnRiskAnalysis)
  @RequirePermission('analytics:read')
  async customerChurnRisk(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ChurnRiskAnalysis> {
    return this.customerAnalyticsService.predictChurnRisk(tenantId, customerId);
  }

  @Query(() => [ChurnRiskAnalysis])
  @RequirePermission('analytics:read')
  async customersChurnRisk(
    @Args('customerIds', { type: () => [ID] }) customerIds: string[],
    @CurrentTenant() tenantId: string,
  ): Promise<ChurnRiskAnalysis[]> {
    return Promise.all(
      customerIds.map(customerId => 
        this.customerAnalyticsService.predictChurnRisk(tenantId, customerId)
      )
    );
  }

  @Query(() => [ChurnRiskAnalysis])
  @RequirePermission('analytics:read')
  async highChurnRiskCustomers(
    @Args('threshold', { defaultValue: 0.7 }) threshold: number,
    @Args('limit', { defaultValue: 50 }) limit: number,
    @CurrentTenant() tenantId: string,
  ): Promise<ChurnRiskAnalysis[]> {
    // This would typically be optimized with a database query
    // For now, we'll implement a basic version
    const metrics = await this.customerAnalyticsService.getCustomerMetrics(tenantId);
    
    // In a real implementation, this would query customers with high churn risk
    // For now, return empty array as placeholder
    return [];
  }

  @Query(() => CustomerMetrics)
  @RequirePermission('analytics:read')
  async customerMetrics(
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerMetrics> {
    return this.customerAnalyticsService.getCustomerMetrics(tenantId);
  }

  // Field resolvers for batch loading optimization
  @ResolveField(() => PurchasePattern)
  async purchasePattern(
    @Parent() ltv: CustomerLifetimeValue,
    @CurrentTenant() tenantId: string,
  ): Promise<PurchasePattern> {
    return this.customerAnalyticsService.analyzePurchasePatterns(tenantId, ltv.customerId);
  }

  @ResolveField(() => ChurnRiskAnalysis)
  async churnRisk(
    @Parent() ltv: CustomerLifetimeValue,
    @CurrentTenant() tenantId: string,
  ): Promise<ChurnRiskAnalysis> {
    return this.customerAnalyticsService.predictChurnRisk(tenantId, ltv.customerId);
  }
}
