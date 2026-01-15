import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
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
import { FeatureFlag, FEATURE_DEFINITIONS, FeatureDefinition } from '../entities/feature-flag.entity';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from '../dto/feature-flag.dto';
import { ObjectType, Field } from '@nestjs/graphql';

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

@Resolver(() => FeatureFlag)
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class FeatureFlagResolver {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
  ) {}

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

  @Mutation(() => FeatureFlag, { name: 'enableFeature' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async enableFeature(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      featureName,
      true,
      { rolloutPercentage: 100 },
    );
  }

  @Mutation(() => FeatureFlag, { name: 'disableFeature' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('features:update')
  async disableFeature(
    @Args('featureName') featureName: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeatureFlag> {
    return this.featureFlagService.setTenantFeatureFlag(
      tenantId,
      featureName,
      false,
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
}
