import { Resolver, Query, Mutation, Args, ID, ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { TenantMetricsTrackingService } from '../services/tenant-metrics-tracking.service';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { RequirePermissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../guards/tenant.guard';
import { BusinessMetrics, BusinessTier } from '../entities/tenant.entity';

@ObjectType()
class BusinessMetricsType {
  @Field(() => Int)
  employeeCount!: number;

  @Field(() => Int)
  locationCount!: number;

  @Field(() => Int)
  monthlyTransactionVolume!: number;

  @Field(() => Float)
  monthlyRevenue!: number;
}

@ObjectType()
class TenantUsageType {
  @Field(() => BusinessMetricsType)
  metrics!: BusinessMetrics;

  @Field()
  businessTier!: string;

  @Field()
  lastUpdated!: Date;
}

@ObjectType()
class TenantLimitsType {
  @Field(() => Int)
  maxEmployees!: number;

  @Field(() => Int)
  maxLocations!: number;

  @Field(() => Int)
  maxMonthlyTransactions!: number;

  @Field()
  currentTier!: string;

  @Field({ nullable: true })
  nextTier!: string | null;
}

@ObjectType()
class TierProgressionType {
  @Field()
  currentTier!: string;

  @Field({ nullable: true })
  nextTier!: string | null;

  @Field(() => Float)
  progress!: number;

  @Field()
  requirements!: string;

  @Field(() => [String])
  recommendations!: string[];
}

@ObjectType()
class MetricsHistoryEntry {
  @Field()
  date!: Date;

  @Field(() => BusinessMetricsType)
  metrics!: BusinessMetrics;

  @Field()
  tier!: string;
}

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class TenantMetricsResolver {
  constructor(
    private readonly metricsTrackingService: TenantMetricsTrackingService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  @Query(() => BusinessMetricsType, { name: 'tenantMetrics' })
  async getTenantMetrics(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BusinessMetrics> {
    // Users can only access their own tenant metrics
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant metrics');
    }

    return this.metricsTrackingService.getRealTimeMetrics(tenantId);
  }

  @Query(() => TenantUsageType, { name: 'tenantUsage' })
  async getTenantUsage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantUsageType> {
    // Users can only access their own tenant usage
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant usage');
    }

    const metrics = await this.metricsTrackingService.getRealTimeMetrics(tenantId);
    const businessTier = this.businessMetricsService.calculateBusinessTier(metrics);

    return {
      metrics,
      businessTier,
      lastUpdated: new Date(),
    };
  }

  @Query(() => TenantLimitsType, { name: 'tenantLimits' })
  async getTenantLimits(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantLimitsType> {
    // Users can only access their own tenant limits
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant limits');
    }

    const metrics = await this.metricsTrackingService.getRealTimeMetrics(tenantId);
    const currentTier = this.businessMetricsService.calculateBusinessTier(metrics);
    const { nextTier } = this.businessMetricsService.getUpgradeRequirements(currentTier);

    // Define tier limits (these would typically come from configuration)
    const tierLimits: Record<BusinessTier, { employees: number; locations: number; transactions: number }> = {
      [BusinessTier.MICRO]: { employees: 5, locations: 1, transactions: 1000 },
      [BusinessTier.SMALL]: { employees: 25, locations: 5, transactions: 10000 },
      [BusinessTier.MEDIUM]: { employees: 100, locations: 20, transactions: 100000 },
      [BusinessTier.ENTERPRISE]: { employees: -1, locations: -1, transactions: -1 }, // unlimited
    };

    const limits = tierLimits[currentTier];

    return {
      maxEmployees: limits.employees,
      maxLocations: limits.locations,
      maxMonthlyTransactions: limits.transactions,
      currentTier: currentTier as string,
      nextTier: nextTier ? (nextTier as string) : null,
    };
  }

  @Query(() => TierProgressionType, { name: 'tierProgression' })
  async getTierProgression(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TierProgressionType> {
    // Users can only access their own tier progression
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant tier progression');
    }

    const progression = await this.metricsTrackingService.getTierProgression(tenantId);

    return {
      currentTier: progression.currentTier as string,
      nextTier: progression.nextTier ? (progression.nextTier as string) : null,
      progress: progression.progress,
      requirements: JSON.stringify(progression.requirements),
      recommendations: progression.recommendations,
    };
  }

  @Query(() => [MetricsHistoryEntry], { name: 'metricsHistory' })
  async getMetricsHistory(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MetricsHistoryEntry[]> {
    // Users can only access their own metrics history
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant metrics history');
    }

    const history = await this.metricsTrackingService.getMetricsHistory(
      tenantId,
      startDate,
      endDate,
    );

    return history.map(entry => ({
      date: entry.date,
      metrics: entry.metrics,
      tier: entry.tier,
    }));
  }

  @Mutation(() => BusinessMetricsType, { name: 'recalculateMetrics' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('tenants:update')
  async recalculateMetrics(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BusinessMetrics> {
    // Users can only recalculate their own tenant metrics
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:update-all')) {
      throw new Error('Access denied: Cannot recalculate other tenant metrics');
    }

    return this.metricsTrackingService.recalculateMetrics(tenantId);
  }
}
