import { Resolver, Query, Mutation, Args, ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { DashboardControllerService, DashboardModule, UpgradePrompt, DashboardConfiguration, DashboardCustomization, ModuleCategory } from '../services/dashboard-controller.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { RequirePermissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../guards/tenant.guard';
import { BusinessTier } from '../entities/tenant.entity';

// Register enums for GraphQL
registerEnumType(ModuleCategory, {
  name: 'ModuleCategory',
  description: 'Dashboard module categories',
});

@ObjectType()
class DashboardModuleType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  icon!: string;

  @Field()
  route!: string;

  @Field()
  component!: string;

  @Field(() => [String])
  requiredFeatures!: string[];

  @Field(() => ModuleCategory)
  category!: ModuleCategory;

  @Field()
  isCore!: boolean;

  @Field(() => Int)
  priority!: number;

  @Field({ nullable: true })
  isNew?: boolean;

  @Field({ nullable: true })
  isPopular?: boolean;

  @Field(() => Int, { nullable: true })
  estimatedSetupTime?: number;
}

@ObjectType()
class UpgradePromptType {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  ctaText!: string;

  @Field()
  ctaUrl!: string;

  @Field()
  requiredTier!: string;

  @Field(() => [String])
  features!: string[];

  @Field()
  priority!: string;

  @Field()
  dismissible!: boolean;

  @Field(() => Int, { nullable: true })
  showAfterDays?: number;
}

@ObjectType()
class DashboardCustomizationType {
  @Field()
  moduleId!: string;

  @Field()
  isVisible!: boolean;

  @Field(() => Int)
  position!: number;

  @Field({ nullable: true })
  customTitle?: string;

  @Field({ nullable: true })
  customIcon?: string;

  @Field({ nullable: true })
  settings?: string; // JSON string
}

@ObjectType()
class DashboardConfigurationType {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => [DashboardModuleType])
  availableModules!: DashboardModule[];

  @Field(() => [DashboardModuleType])
  lockedModules!: DashboardModule[];

  @Field(() => [UpgradePromptType])
  upgradePrompts!: UpgradePrompt[];

  @Field(() => [DashboardCustomizationType])
  customizations!: DashboardCustomization[];

  @Field()
  tier!: string;

  @Field()
  generatedAt!: Date;
}

@ObjectType()
class ModulesByCategoryType {
  @Field(() => [DashboardModuleType])
  available!: DashboardModule[];

  @Field(() => [DashboardModuleType])
  locked!: DashboardModule[];
}

@ObjectType()
class DashboardMetricsType {
  @Field(() => Int)
  totalModules!: number;

  @Field(() => Int)
  availableModules!: number;

  @Field(() => Int)
  lockedModules!: number;

  @Field()
  utilizationRate!: number;

  @Field(() => [String])
  popularModules!: string[];

  @Field()
  setupProgress!: number;
}

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class DashboardControllerResolver {
  constructor(
    private readonly dashboardControllerService: DashboardControllerService,
  ) {}

  @Query(() => DashboardConfigurationType, { name: 'dashboardConfiguration' })
  async getDashboardConfiguration(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DashboardConfigurationType> {
    const config = await this.dashboardControllerService.getDashboardConfiguration(tenantId, user.id);
    
    return {
      ...config,
      tier: config.tier.toString(),
      customizations: config.customizations.map(c => ({
        ...c,
        settings: c.settings ? JSON.stringify(c.settings) : undefined,
      })),
    };
  }

  @Query(() => ModulesByCategoryType, { name: 'modulesByCategory' })
  async getModulesByCategory(
    @Args('category', { type: () => ModuleCategory }) category: ModuleCategory,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ModulesByCategoryType> {
    return this.dashboardControllerService.getModulesByCategory(tenantId, category, user.id);
  }

  @Query(() => [UpgradePromptType], { name: 'upgradePrompts' })
  async getUpgradePrompts(
    @Args('priority', { nullable: true }) priority: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpgradePromptType[]> {
    const validPriority = priority as 'low' | 'medium' | 'high' | undefined;
    const prompts = await this.dashboardControllerService.getUpgradePrompts(tenantId, user.id, validPriority);
    
    return prompts.map(prompt => ({
      ...prompt,
      requiredTier: prompt.requiredTier.toString(),
    }));
  }

  @Query(() => DashboardMetricsType, { name: 'dashboardMetrics' })
  async getDashboardMetrics(
    @CurrentTenant() tenantId: string,
  ): Promise<DashboardMetricsType> {
    return this.dashboardControllerService.getDashboardMetrics(tenantId);
  }

  @Mutation(() => Boolean, { name: 'updateDashboardCustomizations' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('dashboard:update')
  async updateDashboardCustomizations(
    @Args('customizations', { type: () => [DashboardCustomizationInput] }) customizations: DashboardCustomizationInput[],
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const parsedCustomizations: DashboardCustomization[] = customizations.map(c => ({
      moduleId: c.moduleId,
      isVisible: c.isVisible,
      position: c.position,
      customTitle: c.customTitle,
      customIcon: c.customIcon,
      settings: c.settings ? JSON.parse(c.settings) : undefined,
    }));

    await this.dashboardControllerService.updateDashboardCustomizations(
      tenantId,
      parsedCustomizations,
      user.id,
    );

    return true;
  }

  @Mutation(() => Boolean, { name: 'invalidateDashboardCache' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('dashboard:update')
  async invalidateDashboardCache(
    @CurrentTenant() tenantId: string,
    @Args('userId', { nullable: true }) userId?: string,
  ): Promise<boolean> {
    await this.dashboardControllerService.invalidateDashboardCache(tenantId, userId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'preloadDashboardConfiguration' })
  async preloadDashboardConfiguration(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.dashboardControllerService.preloadDashboardConfiguration(tenantId, user.id);
    return true;
  }
}

// Input types
import { InputType } from '@nestjs/graphql';

@InputType()
class DashboardCustomizationInput {
  @Field()
  moduleId!: string;

  @Field()
  isVisible!: boolean;

  @Field(() => Int)
  position!: number;

  @Field({ nullable: true })
  customTitle?: string;

  @Field({ nullable: true })
  customIcon?: string;

  @Field({ nullable: true })
  settings?: string; // JSON string
}