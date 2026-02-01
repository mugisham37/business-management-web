import { Resolver, Query, Mutation, Args, ID, ObjectType, Field, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { FeatureFlagService } from '../services/feature-flag.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { TenantInterceptor } from '../interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { AuthenticatedUser } from '../guards/tenant.guard';
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateBusinessMetricsDto,
  TenantQueryDto,
} from '../dto/tenant.dto';
import { Tenant, BusinessTier } from '../entities/tenant.entity';

@ObjectType()
class UpgradeRequirementsResponse {
  @Field({ nullable: true })
  nextTier!: string | null;

  @Field(() => [String])
  requirements!: string[];

  @Field(() => [String])
  missingCriteria!: string[];
}

@ObjectType()
class TierProgressResponse {
  @Field()
  currentTier!: string;

  @Field(() => Int)
  currentTierProgress!: number;

  @Field(() => Int)
  nextTierProgress!: number;

  @Field({ nullable: true })
  nextTier!: string | null;
}

@ObjectType()
class BulkTenantResponse {
  @Field(() => [Tenant])
  tenants!: Tenant[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;

  @Field(() => Int)
  totalPages!: number;
}

@ObjectType()
class TenantAnalyticsResponse {
  @Field()
  tenantId!: string;

  @Field()
  businessTier!: string;

  @Field()
  metricsQuality!: string;

  @Field(() => Int)
  criteriaMetCount!: number;

  @Field()
  readiness!: string;
}

@ObjectType()
class TierBenefitsResponse {
  @Field()
  tier!: string;

  @Field()
  description!: string;

  @Field(() => [String])
  features!: string[];

  @Field()
  limits!: any;
}

@ObjectType()
class MetricsValidationResponse {
  @Field()
  isValid!: boolean;

  @Field(() => [String])
  errors!: string[];
}

@ObjectType()
class TenantContextResponse {
  @Field(() => Tenant)
  tenant!: Tenant;

  @Field()
  businessTier!: string;

  @Field()
  isActive!: boolean;
}

@Resolver(() => Tenant)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
export class TenantResolver {
  constructor(
    private readonly tenantService: TenantService,
    private readonly businessMetricsService: BusinessMetricsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  /**
   * Field Resolvers - Computed fields for Tenant type
   */
  @ResolveField(() => Int, { name: 'daysUntilTrialEnd', nullable: true })
  async getDaysUntilTrialEnd(@Parent() tenant: Tenant): Promise<number | null> {
    if (!tenant.trialEndDate) return null;
    const now = new Date();
    const trialEnd = new Date(tenant.trialEndDate);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  @ResolveField(() => Boolean, { name: 'isTrialActive' })
  async getIsTrialActive(@Parent() tenant: Tenant): Promise<boolean> {
    if (!tenant.trialEndDate) return false;
    const now = new Date();
    const trialEnd = new Date(tenant.trialEndDate);
    return now < trialEnd;
  }

  @ResolveField(() => Int, { name: 'tierProgressPercentage' })
  async getTierProgressPercentage(@Parent() tenant: Tenant): Promise<number> {
    const progress = this.businessMetricsService.calculateTierProgress(
      tenant.metrics,
      tenant.businessTier,
    );
    return progress.nextTierProgress;
  }

  @ResolveField(() => String, { name: 'nextTier', nullable: true })
  async getNextTier(@Parent() tenant: Tenant): Promise<string | null> {
    const { nextTier } = this.businessMetricsService.getUpgradeRequirements(tenant.businessTier);
    return nextTier ? (nextTier as string) : null;
  }

  @ResolveField(() => [String], { name: 'availableFeatures' })
  async getAvailableFeatures(@Parent() tenant: Tenant): Promise<string[]> {
    const { available } = await this.featureFlagService.getAvailableFeatures(tenant.id);
    return available.map(f => f.name);
  }

  @ResolveField(() => Int, { name: 'featureCount' })
  async getFeatureCount(@Parent() tenant: Tenant): Promise<number> {
    const { available } = await this.featureFlagService.getAvailableFeatures(tenant.id);
    return available.length;
  }

  @ResolveField(() => String, { name: 'healthStatus' })
  async getHealthStatus(@Parent() tenant: Tenant): Promise<string> {
    if (!tenant.isActive) return 'inactive';
    if (tenant.subscriptionStatus === 'suspended') return 'suspended';
    if (tenant.subscriptionStatus === 'past_due') return 'warning';
    return 'healthy';
  }

  @ResolveField(() => Int, { name: 'accountAge' })
  async getAccountAge(@Parent() tenant: Tenant): Promise<number> {
    const now = new Date();
    const created = new Date(tenant.createdAt);
    const diffTime = now.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @Query(() => Tenant, { name: 'tenant' })
  @UseGuards(TenantGuard)
  async getTenant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tenant> {
    // Users can only access their own tenant or super admins can access any
    if (user.tenantId !== id && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Cannot access other tenant data');
    }

    const tenant = await this.tenantService.findById(id);
    if (!tenant) {
      throw new Error(`Tenant with ID '${id}' not found`);
    }

    return tenant;
  }

  @Query(() => [Tenant], { name: 'tenants' })
  async getTenants(
    @Args('query', { type: () => TenantQueryDto, nullable: true }) query: TenantQueryDto = {},
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tenant[]> {
    // Only super admins can list all tenants
    if (!user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Insufficient permissions');
    }

    const { tenants } = await this.tenantService.findAll(query);
    return tenants;
  }

  @Mutation(() => Tenant)
  async createTenant(
    @Args('input') input: CreateTenantDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tenant> {
    // Only super admins can create tenants
    if (!user.permissions.includes('tenants:create')) {
      throw new Error('Access denied: Insufficient permissions');
    }

    return this.tenantService.create(input, user.id);
  }

  @Mutation(() => Tenant)
  @UseGuards(TenantGuard)
  async updateTenant(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTenantDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tenant> {
    // Users can only update their own tenant or super admins can update any
    if (user.tenantId !== id && !user.permissions.includes('tenants:update-all')) {
      throw new Error('Access denied: Cannot update other tenant data');
    }

    return this.tenantService.update(id, input, user.id);
  }

  @Mutation(() => Tenant)
  @UseGuards(TenantGuard)
  async updateBusinessMetrics(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBusinessMetricsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tenant> {
    // Users can only update their own tenant metrics
    if (user.tenantId !== id && !user.permissions.includes('tenants:update-all')) {
      throw new Error('Access denied: Cannot update other tenant metrics');
    }

    return this.tenantService.updateBusinessMetrics(id, input, user.id);
  }

  @Mutation(() => Boolean)
  async deleteTenant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    // Only super admins can delete tenants
    if (!user.permissions.includes('tenants:delete')) {
      throw new Error('Access denied: Insufficient permissions');
    }

    await this.tenantService.delete(id, user.id);
    return true;
  }

  @Query(() => String, { name: 'calculateBusinessTier' })
  calculateBusinessTier(
    @Args('employeeCount') employeeCount: number,
    @Args('locationCount') locationCount: number,
    @Args('monthlyTransactionVolume') monthlyTransactionVolume: number,
    @Args('monthlyRevenue') monthlyRevenue: number,
  ): BusinessTier {
    return this.businessMetricsService.calculateBusinessTier({
      employeeCount,
      locationCount,
      monthlyTransactionVolume,
      monthlyRevenue,
    });
  }

  @Query(() => UpgradeRequirementsResponse, { name: 'getUpgradeRequirements' })
  @UseGuards(TenantGuard)
  getUpgradeRequirements(
    @CurrentUser() user: AuthenticatedUser,
  ): UpgradeRequirementsResponse {
    const requirements = this.businessMetricsService.getUpgradeRequirements(user.tenantId as any);
    return {
      nextTier: requirements.nextTier ? (requirements.nextTier as string) : null,
      requirements: requirements.missingCriteria,
      missingCriteria: requirements.missingCriteria,
    };
  }

  @Query(() => UpgradeRequirementsResponse, { name: 'upgradeRequirementsForTenant' })
  @UseGuards(TenantGuard)
  async upgradeRequirementsForTenant(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpgradeRequirementsResponse> {
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied');
    }

    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new Error(`Tenant with ID '${tenantId}' not found`);
    }

    const requirements = this.businessMetricsService.getUpgradeRequirements(tenant.businessTier);
    return {
      nextTier: requirements.nextTier ? (requirements.nextTier as string) : null,
      requirements: requirements.missingCriteria,
      missingCriteria: requirements.missingCriteria,
    };
  }

  @Query(() => TierProgressResponse, { name: 'tierProgress' })
  @UseGuards(TenantGuard)
  async getTierProgress(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TierProgressResponse> {
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied');
    }

    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found`);
    }

    const progress = this.businessMetricsService.calculateTierProgress(tenant.metrics, tenant.businessTier);
    const requirements = this.businessMetricsService.getUpgradeRequirements(tenant.businessTier);

    return {
      currentTier: tenant.businessTier as string,
      currentTierProgress: progress.currentTierProgress,
      nextTierProgress: progress.nextTierProgress,
      nextTier: requirements.nextTier ? (requirements.nextTier as string) : null,
    };
  }

  @Query(() => BulkTenantResponse, { name: 'tenantsPaginated' })
  async getTenantsPaginated(
    @Args('query', { type: () => TenantQueryDto, nullable: true }) query: TenantQueryDto = {},
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkTenantResponse> {
    if (!user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied: Insufficient permissions');
    }

    const { tenants, total } = await this.tenantService.findAll(query);
    const page = query.page || 1;
    const pageSize = query.limit || 20;
    const totalPages = Math.ceil(total / pageSize);

    return {
      tenants,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  @Query(() => TenantAnalyticsResponse, { name: 'tenantAnalytics' })
  @UseGuards(TenantGuard)
  async getTenantAnalytics(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantAnalyticsResponse> {
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied');
    }

    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found`);
    }

    const metrics = tenant.metrics;
    const tierProgress = this.businessMetricsService.calculateTierProgress(metrics, tenant.businessTier);

    return {
      tenantId,
      businessTier: tenant.businessTier as string,
      metricsQuality: tierProgress.currentTierProgress >= 100 ? 'Excellent' : tierProgress.currentTierProgress >= 75 ? 'Good' : tierProgress.currentTierProgress >= 50 ? 'Fair' : 'Poor',
      criteriaMetCount: Object.values(metrics).filter(v => v > 0).length,
      readiness: tierProgress.nextTierProgress >= 75 ? 'Ready to Upgrade' : tierProgress.nextTierProgress >= 50 ? 'Good Progress' : 'Early Stage',
    };
  }

  @Query(() => [TierBenefitsResponse], { name: 'allTierBenefits' })
  async getAllTierBenefits(): Promise<TierBenefitsResponse[]> {
    const tiers = [BusinessTier.MICRO, BusinessTier.SMALL, BusinessTier.MEDIUM, BusinessTier.ENTERPRISE];
    return tiers.map(tier => {
      const benefits = this.businessMetricsService.getTierBenefits(tier);
      return {
        tier: tier as string,
        description: benefits.description,
        features: benefits.features,
        limits: benefits.limits,
      };
    });
  }

  @Query(() => TierBenefitsResponse, { name: 'tierBenefits' })
  async getTierBenefits(
    @Args('tier') tier: string,
  ): Promise<TierBenefitsResponse> {
    const benefits = this.businessMetricsService.getTierBenefits(tier as BusinessTier);
    return {
      tier,
      description: benefits.description,
      features: benefits.features,
      limits: benefits.limits,
    };
  }

  @Query(() => MetricsValidationResponse, { name: 'validateMetrics' })
  validateMetrics(
    @Args('employeeCount') employeeCount: number,
    @Args('locationCount') locationCount: number,
    @Args('monthlyTransactionVolume') monthlyTransactionVolume: number,
    @Args('monthlyRevenue') monthlyRevenue: number,
  ): MetricsValidationResponse {
    const validation = this.businessMetricsService.validateMetrics({
      employeeCount,
      locationCount,
      monthlyTransactionVolume,
      monthlyRevenue,
    });
    return {
      isValid: validation.isValid,
      errors: validation.errors,
    };
  }

  @Query(() => [String], { name: 'recommendedActions' })
  @UseGuards(TenantGuard)
  async getRecommendedActions(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied');
    }

    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found`);
    }

    return this.businessMetricsService.getRecommendedActions(tenant.metrics, tenant.businessTier);
  }

  @Query(() => Boolean, { name: 'isValidTenant' })
  async checkTenantValidity(
    @Args('tenantId', { type: () => ID }) tenantId: string,
  ): Promise<boolean> {
    return this.tenantService.isValidTenant(tenantId);
  }

  @Query(() => TenantContextResponse, { name: 'tenantContext' })
  @UseGuards(TenantGuard)
  async getTenantContext(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantContextResponse> {
    if (user.tenantId !== tenantId && !user.permissions.includes('tenants:read-all')) {
      throw new Error('Access denied');
    }

    const context = await this.tenantService.getTenantContext(tenantId);
    return {
      tenant: context.tenant,
      businessTier: context.businessTier as string,
      isActive: context.isActive,
    };
  }
}