import { Resolver, Query, Mutation, Args, Subscription, ResolveField, Parent, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { FeatureFlagService } from '../services/feature-flag.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { RequirePermissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../guards/tenant.guard';
import { FeatureFlag, FeatureDefinition, FeatureFlagStatus, FeatureRule, FEATURE_DEFINITIONS } from '../entities/feature-flag.entity';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from '../dto/feature-flag.dto';

@ObjectType()
class FeatureDefinitionType {
  @Field()
  name!: string;

  @Field()
  displayName!: string;

  @Field()
  description!: string;

  @Field()
  requiredTier!: string;

  @Field()
  category!: string;

  @Field(() => [String], { nullable: true })
  dependencies?: string[];
}

@ObjectType()
class AvailableFeaturesResponse {
  @Field(() => [FeatureDefinitionType])
  available!: FeatureDefinition[];

  @Field(() => [FeatureDefinitionType])
  unavailable!: FeatureDefinition[];

  @Field(() => [FeatureDefinitionType])
  upgradeRequired!: FeatureDefinition[];
}

@ObjectType()
class FeatureAccessResponse {
  @Field()
  featureName!: string;

  @Field()
  hasAccess!: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
class FeaturesByTierResponse {
  @Field()
  tier!: string;

  @Field(() => [FeatureDefinitionType])
  features!: FeatureDefinition[];

  @Field(() => Int)
  count!: number;
}

@ObjectType()
class FeatureCategoriesResponse {
  @Field()
  category!: string;

  @Field(() => [FeatureDefinitionType])
  features!: FeatureDefinition[];

  @Field(() => Int)
  count!: number;
}

@ObjectType()
class FeatureDependenciesResponse {
  @Field()
  featureName!: string;

  @Field(() => [String])
  dependencies!: string[];

  @Field(() => [FeatureAccessResponse])
  dependenciesStatus!: FeatureAccessResponse[];
}

@Resolver(() => FeatureFlag)
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class FeatureFlagResolver {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  /**
   * Field Resolvers - Computed fields for FeatureFlag type
   */
  @ResolveField(() => String, { name: 'displayName' })
  async getDisplayName(@Parent() featureFlag: FeatureFlag): Promise<string> {
    const definition = FEATURE_DEFINITIONS[featureFlag.featureName];
    return definition?.displayName || featureFlag.featureName;
  }

  @ResolveField(() => String, { name: 'category' })
  async getCategory(@Parent() featureFlag: FeatureFlag): Promise<string> {
    const definition = FEATURE_DEFINITIONS[featureFlag.featureName];
    return definition?.category || 'uncategorized';
  }

  @ResolveField(() => [String], { name: 'dependencies', nullable: true })
  async getDependencies(@Parent() featureFlag: FeatureFlag): Promise<string[] | null> {
    const definition = FEATURE_DEFINITIONS[featureFlag.featureName];
    return definition?.dependencies || null;
  }

  @ResolveField(() => Boolean, { name: 'isFullyRolledOut' })
  async getIsFullyRolledOut(@Parent() featureFlag: FeatureFlag): Promise<boolean> {
    return featureFlag.rolloutPercentage === 100 && featureFlag.isEnabled;
  }

  @ResolveField(() => Int, { name: 'daysEnabled', nullable: true })
  async getDaysEnabled(@Parent() featureFlag: FeatureFlag): Promise<number | null> {
    if (!featureFlag.enabledAt) return null;
    const now = new Date();
    const enabled = new Date(featureFlag.enabledAt);
    const diffTime = now.getTime() - enabled.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @ResolveField(() => Int, { name: 'daysDisabled', nullable: true })
  async getDaysDisabled(@Parent() featureFlag: FeatureFlag): Promise<number | null> {
    if (!featureFlag.disabledAt) return null;
    const now = new Date();
    const disabled = new Date(featureFlag.disabledAt);
    const diffTime = now.getTime() - disabled.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  @Query(() => [FeatureDefinitionType], { name: 'featureDefinitions' })
  async getFeatureDefinitions(): Promise<FeatureDefinition[]> {
    const definitions = this.featureFlagService.getFeatureDefinitions();
    return Object.values(definitions);
  }

  @Query(() => AvailableFeaturesResponse, { name: 'availableFeatures' })
  async getAvailableFeatures(
    @CurrentTenant() tenantId: string,
  ): Promise<AvailableFeaturesResponse> {
    return this.featureFlagService.getAvailableFeatures(tenantId);
  }

  @Query(() => FeatureAccessResponse, { name: 'checkFeatureAccess' })
  async checkFeatureAccess(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureAccessResponse> {
    const hasAccess = await this.featureFlagService.hasFeature(
      tenantId,
      featureName,
      {
        userId: user.id,
        userRoles: [user.role],
      },
    );

    return {
      featureName,
      hasAccess,
      reason: hasAccess ? 'Feature is available' : 'Feature is not available for your tier',
    };
  }

  @Query(() => [FeatureAccessResponse], { name: 'checkMultipleFeatures' })
  async checkMultipleFeatures(
    @Args('featureNames', { type: () => [String] }) featureNames: string[],
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureAccessResponse[]> {
    const results: FeatureAccessResponse[] = [];

    for (const featureName of featureNames) {
      const hasAccess = await this.featureFlagService.hasFeature(
        tenantId,
        featureName,
        {
          userId: user.id,
          userRoles: [user.role],
        },
      );

      results.push({
        featureName,
        hasAccess,
        reason: hasAccess ? 'Feature is available' : 'Feature is not available for your tier',
      });
    }

    return results;
  }

  @Query(() => [FeatureDefinitionType], { name: 'featuresByCategory' })
  async getFeaturesByCategory(
    @Args('category') category: string,
  ): Promise<FeatureDefinition[]> {
    return this.featureFlagService.getFeaturesByCategory(category);
  }

  @Query(() => [FeatureDefinitionType], { name: 'featuresByTier' })
  async getFeaturesByTier(
    @Args('tier') tier: string,
  ): Promise<FeatureDefinition[]> {
    return this.featureFlagService.getFeaturesByTier(tier as any);
  }

  @Query(() => FeatureCategoriesResponse, { name: 'featureCategoryDetails' })
  async getFeatureCategoryDetails(
    @Args('category') category: string,
  ): Promise<FeatureCategoriesResponse> {
    const features = this.featureFlagService.getFeaturesByCategory(category);
    return {
      category,
      features,
      count: features.length,
    };
  }

  @Query(() => FeaturesByTierResponse, { name: 'featureTierDetails' })
  async getFeatureTierDetails(
    @Args('tier') tier: string,
  ): Promise<FeaturesByTierResponse> {
    const features = this.featureFlagService.getFeaturesByTier(tier as any);
    return {
      tier,
      features,
      count: features.length,
    };
  }

  @Query(() => FeatureDependenciesResponse, { name: 'featureDependencies' })
  async getFeatureDependencies(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureDependenciesResponse> {
    const definitions = this.featureFlagService.getFeatureDefinitions();
    const featureDef = definitions[featureName];
    
    if (!featureDef) {
      throw new Error(`Feature '${featureName}' not found`);
    }

    const dependencies = featureDef.dependencies || [];
    const dependenciesStatus: FeatureAccessResponse[] = [];

    for (const depFeature of dependencies) {
      const hasAccess = await this.featureFlagService.hasFeature(
        tenantId,
        depFeature,
        {
          userId: user.id,
          userRoles: [user.role],
        },
      );

      dependenciesStatus.push({
        featureName: depFeature,
        hasAccess,
        reason: hasAccess ? 'Available' : 'Not available',
      });
    }

    return {
      featureName,
      dependencies,
      dependenciesStatus,
    };
  }

  @Mutation(() => FeatureFlag, { name: 'createFeatureFlag' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:create')
  async createFeatureFlag(
    @Args('input') input: CreateFeatureFlagDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    const options: {
      rolloutPercentage?: number;
      customRules?: FeatureRule[];
      status?: FeatureFlagStatus;
    } = {};

    if (input.rolloutPercentage !== undefined) {
      options.rolloutPercentage = input.rolloutPercentage;
    }
    if (input.customRules !== undefined) {
      options.customRules = input.customRules;
    }
    if (input.status !== undefined) {
      options.status = input.status;
    }

    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      input.featureName,
      input.isEnabled ?? true,
      options,
    );
  }

  @Mutation(() => FeatureFlag, { name: 'enableFeature' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async enableFeature(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      featureName,
      true,
      { rolloutPercentage: 100, status: FeatureFlagStatus.ENABLED },
    );
  }

  @Mutation(() => FeatureFlag, { name: 'disableFeature' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async disableFeature(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      featureName,
      false,
      { status: FeatureFlagStatus.DISABLED },
    );
  }

  @Mutation(() => FeatureFlag, { name: 'updateFeatureFlag' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async updateFeatureFlag(
    @Args('featureName') featureName: string,
    @Args('input') input: UpdateFeatureFlagDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    const options: {
      rolloutPercentage?: number;
      customRules?: any[];
      status?: any;
    } = {};
    
    if (input.rolloutPercentage !== undefined) {
      options.rolloutPercentage = input.rolloutPercentage;
    }
    if (input.customRules !== undefined) {
      options.customRules = input.customRules;
    }
    if (input.status !== undefined) {
      options.status = input.status;
    }

    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      featureName,
      input.isEnabled ?? true,
      options,
    );
  }

  @Mutation(() => [FeatureFlag], { name: 'bulkUpdateFeatureFlags' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async bulkUpdateFeatureFlags(
    @Args('updates', { type: () => [UpdateFeatureFlagDto] }) updates: UpdateFeatureFlagDto[],
    @CurrentTenant() tenantId: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<FeatureFlag[]> {
    const results: FeatureFlag[] = [];

    for (const update of updates) {
      if (!update.featureName) {
        throw new Error('Feature name is required for bulk update');
      }

      const options: {
        rolloutPercentage?: number;
        customRules?: FeatureRule[];
        status?: FeatureFlagStatus;
      } = {};

      if (update.rolloutPercentage !== undefined) {
        options.rolloutPercentage = update.rolloutPercentage;
      }
      if (update.customRules !== undefined) {
        options.customRules = update.customRules;
      }
      if (update.status !== undefined) {
        options.status = update.status;
      }

      const result = await this.featureFlagService.setTenantFeatureFlag(
        tenantId,
        update.featureName,
        update.isEnabled ?? true,
        options,
      );

      results.push(result);
    }

    return results;
  }

  @Mutation(() => Boolean, { name: 'invalidateFeatureCache' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async invalidateFeatureCache(
    @Args('featureName', { nullable: true }) featureName: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.featureFlagService.invalidateFeatureCache(tenantId, featureName);
    return true;
  }

  @Mutation(() => Boolean, { name: 'invalidateAllFeatureCache' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async invalidateAllFeatureCache(
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.featureFlagService.invalidateFeatureCache(tenantId);
    return true;
  }
}
