import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectType, Field } from '@nestjs/graphql';
import { FeatureFlagService } from '../services/feature-flag.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { BusinessTier } from '../entities/tenant.entity';
import { FEATURE_DEFINITIONS } from '../entities/feature-flag.entity';

/**
 * Module access type for tier-based visibility
 */
@ObjectType()
export class ModuleAccessType {
    @Field()
    moduleName!: string;

    @Field()
    displayName!: string;

    @Field()
    isAccessible!: boolean;

    @Field(() => BusinessTier)
    requiredTier!: BusinessTier;

    @Field({ nullable: true })
    upgradePrompt!: string | null;

    @Field()
    category!: string;

    @Field({ nullable: true })
    description!: string | null;
}

/**
 * Dashboard module definition for sidebar
 */
interface DashboardModule {
    name: string;
    displayName: string;
    category: string;
    requiredTier: BusinessTier;
    description: string;
    icon?: string;
}

/**
 * Dashboard modules mapped to sidebar items
 */
const DASHBOARD_MODULES: DashboardModule[] = [
    // Core features - MICRO tier
    { name: 'dashboard', displayName: 'Dashboard', category: 'core', requiredTier: BusinessTier.MICRO, description: 'Business overview and metrics' },
    { name: 'point-of-sale', displayName: 'Point of Sale', category: 'core', requiredTier: BusinessTier.MICRO, description: 'Process sales transactions' },
    { name: 'inventory-management', displayName: 'Inventory', category: 'core', requiredTier: BusinessTier.MICRO, description: 'Manage stock and products' },
    { name: 'customer-management', displayName: 'Customers', category: 'core', requiredTier: BusinessTier.MICRO, description: 'Customer profiles and CRM' },
    { name: 'basic-reporting', displayName: 'Reports', category: 'core', requiredTier: BusinessTier.MICRO, description: 'Basic sales reports' },

    // Growth features - SMALL tier
    { name: 'multi-location', displayName: 'Locations', category: 'growth', requiredTier: BusinessTier.SMALL, description: 'Manage multiple locations' },
    { name: 'advanced-inventory', displayName: 'Advanced Inventory', category: 'growth', requiredTier: BusinessTier.SMALL, description: 'Stock transfers and variants' },
    { name: 'loyalty-program', displayName: 'Loyalty', category: 'growth', requiredTier: BusinessTier.SMALL, description: 'Customer rewards program' },
    { name: 'advanced-crm', displayName: 'CRM', category: 'growth', requiredTier: BusinessTier.SMALL, description: 'Advanced customer management' },
    { name: 'real-time-sync', displayName: 'Real-time Sync', category: 'growth', requiredTier: BusinessTier.SMALL, description: 'Live data synchronization' },

    // Business features - MEDIUM tier
    { name: 'b2b-operations', displayName: 'B2B Sales', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Business-to-business operations' },
    { name: 'financial-management', displayName: 'Finance', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Financial management and accounting' },
    { name: 'quote-management', displayName: 'Quotes', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Create and manage quotes' },
    { name: 'employee-management', displayName: 'Employees', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Staff scheduling and management' },
    { name: 'payroll-management', displayName: 'Payroll', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Employee payroll processing' },
    { name: 'advanced-analytics', displayName: 'Analytics', category: 'business', requiredTier: BusinessTier.MEDIUM, description: 'Advanced business analytics' },

    // Enterprise features - ENTERPRISE tier
    { name: 'custom-integrations', displayName: 'Integrations', category: 'enterprise', requiredTier: BusinessTier.ENTERPRISE, description: 'Custom API integrations' },
    { name: 'warehouse-management', displayName: 'Warehouse', category: 'enterprise', requiredTier: BusinessTier.ENTERPRISE, description: 'Warehouse and logistics' },
    { name: 'predictive-analytics', displayName: 'Predictions', category: 'enterprise', requiredTier: BusinessTier.ENTERPRISE, description: 'AI-powered predictions' },
    { name: 'franchise-management', displayName: 'Franchise', category: 'enterprise', requiredTier: BusinessTier.ENTERPRISE, description: 'Manage franchise network' },
    { name: 'api-access', displayName: 'API', category: 'enterprise', requiredTier: BusinessTier.ENTERPRISE, description: 'Full API access' },
];

/**
 * Tier access resolver for checking module visibility
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class TierAccessResolver {
    constructor(private readonly featureFlagService: FeatureFlagService) { }

    /**
     * Get all modules with access status for current tenant
     */
    @Query(() => [ModuleAccessType], {
        description: 'Get all dashboard modules with access status',
    })
    async myModuleAccess(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<ModuleAccessType[]> {
        const modules: ModuleAccessType[] = [];

        for (const module of DASHBOARD_MODULES) {
            const isAccessible = await this.featureFlagService.hasFeature(
                user.tenantId,
                module.name,
            );

            modules.push({
                moduleName: module.name,
                displayName: module.displayName,
                isAccessible,
                requiredTier: module.requiredTier,
                upgradePrompt: isAccessible ? null : this.getUpgradePrompt(module.requiredTier),
                category: module.category,
                description: module.description,
            });
        }

        return modules;
    }

    /**
     * Check if current tenant can access a specific module
     */
    @Query(() => Boolean, {
        description: 'Check if tenant can access a specific module',
    })
    async canAccessModule(
        @CurrentUser() user: AuthenticatedUser,
        @Args('module') moduleName: string,
    ): Promise<boolean> {
        return this.featureFlagService.hasFeature(user.tenantId, moduleName);
    }

    /**
     * Get accessible modules only
     */
    @Query(() => [ModuleAccessType], {
        description: 'Get only accessible modules for current tenant',
    })
    async myAccessibleModules(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<ModuleAccessType[]> {
        const allModules = await this.myModuleAccess(user);
        return allModules.filter(m => m.isAccessible);
    }

    /**
     * Get locked modules (features requiring upgrade)
     */
    @Query(() => [ModuleAccessType], {
        description: 'Get locked modules requiring upgrade',
    })
    async myLockedModules(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<ModuleAccessType[]> {
        const allModules = await this.myModuleAccess(user);
        return allModules.filter(m => !m.isAccessible);
    }

    /**
     * Get modules by category
     */
    @Query(() => [ModuleAccessType], {
        description: 'Get modules filtered by category',
    })
    async modulesByCategory(
        @CurrentUser() user: AuthenticatedUser,
        @Args('category') category: string,
    ): Promise<ModuleAccessType[]> {
        const allModules = await this.myModuleAccess(user);
        return allModules.filter(m => m.category === category);
    }

    /**
     * Get upgrade prompt text based on tier
     */
    private getUpgradePrompt(requiredTier: BusinessTier): string {
        switch (requiredTier) {
            case BusinessTier.SMALL:
                return 'Upgrade to Growth plan to unlock this feature';
            case BusinessTier.MEDIUM:
                return 'Upgrade to Business plan to unlock this feature';
            case BusinessTier.ENTERPRISE:
                return 'Upgrade to Industry plan to unlock this feature';
            default:
                return 'Upgrade your plan to unlock this feature';
        }
    }
}
