import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { FeatureFlagService } from './feature-flag.service';
import { RealTimePermissionService } from './real-time-permission.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessTier } from '../entities/tenant.entity';
import { FeatureDefinition } from '../entities/feature-flag.entity';

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  component: string;
  requiredFeatures: string[];
  category: ModuleCategory;
  isCore: boolean;
  priority: number;
  isNew?: boolean;
  isPopular?: boolean;
  estimatedSetupTime?: number; // in minutes
}

export interface UpgradePrompt {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  requiredTier: BusinessTier;
  features: string[];
  priority: 'low' | 'medium' | 'high';
  dismissible: boolean;
  showAfterDays?: number;
}

export interface DashboardConfiguration {
  tenantId: string;
  userId?: string;
  availableModules: DashboardModule[];
  lockedModules: DashboardModule[];
  upgradePrompts: UpgradePrompt[];
  customizations: DashboardCustomization[];
  tier: BusinessTier;
  generatedAt: Date;
}

export interface DashboardCustomization {
  moduleId: string;
  isVisible: boolean;
  position: number;
  customTitle?: string;
  customIcon?: string;
  settings?: Record<string, any>;
}

export enum ModuleCategory {
  CORE = 'core',
  SALES = 'sales',
  INVENTORY = 'inventory',
  CUSTOMERS = 'customers',
  EMPLOYEES = 'employees',
  FINANCIAL = 'financial',
  ANALYTICS = 'analytics',
  INTEGRATIONS = 'integrations',
  SETTINGS = 'settings',
}

@Injectable()
export class DashboardControllerService {
  private readonly CACHE_TTL = 600; // 10 minutes
  private readonly CACHE_PREFIX = 'dashboard';

  // Predefined dashboard modules
  private readonly DASHBOARD_MODULES: DashboardModule[] = [
    // Core modules
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'Get a quick overview of your business performance',
      icon: 'dashboard',
      route: '/dashboard',
      component: 'DashboardOverview',
      requiredFeatures: ['basic-reporting'],
      category: ModuleCategory.CORE,
      isCore: true,
      priority: 1,
    },
    {
      id: 'quick-sale',
      title: 'Quick Sale',
      description: 'Process transactions quickly and efficiently',
      icon: 'shopping-cart',
      route: '/pos/quick-sale',
      component: 'QuickSale',
      requiredFeatures: ['point-of-sale'],
      category: ModuleCategory.SALES,
      isCore: true,
      priority: 2,
      estimatedSetupTime: 5,
    },

    // Sales modules
    {
      id: 'pos-terminal',
      title: 'POS Terminal',
      description: 'Full-featured point of sale terminal',
      icon: 'cash-register',
      route: '/pos/terminal',
      component: 'POSTerminal',
      requiredFeatures: ['point-of-sale'],
      category: ModuleCategory.SALES,
      isCore: false,
      priority: 3,
      estimatedSetupTime: 10,
    },
    {
      id: 'advanced-pos',
      title: 'Advanced POS',
      description: 'Advanced POS with discounts, promotions, and complex pricing',
      icon: 'calculator',
      route: '/pos/advanced',
      component: 'AdvancedPOS',
      requiredFeatures: ['advanced-pos'],
      category: ModuleCategory.SALES,
      isCore: false,
      priority: 4,
      isNew: true,
      estimatedSetupTime: 15,
    },

    // Inventory modules
    {
      id: 'inventory-overview',
      title: 'Inventory Overview',
      description: 'Monitor stock levels and inventory health',
      icon: 'boxes',
      route: '/inventory',
      component: 'InventoryOverview',
      requiredFeatures: ['inventory-management'],
      category: ModuleCategory.INVENTORY,
      isCore: true,
      priority: 5,
    },
    {
      id: 'product-catalog',
      title: 'Product Catalog',
      description: 'Manage your product catalog and pricing',
      icon: 'tags',
      route: '/inventory/products',
      component: 'ProductCatalog',
      requiredFeatures: ['inventory-management'],
      category: ModuleCategory.INVENTORY,
      isCore: false,
      priority: 6,
      estimatedSetupTime: 20,
    },
    {
      id: 'warehouse-management',
      title: 'Warehouse Management',
      description: 'Advanced warehouse operations and bin locations',
      icon: 'warehouse',
      route: '/inventory/warehouse',
      component: 'WarehouseManagement',
      requiredFeatures: ['warehouse-management'],
      category: ModuleCategory.INVENTORY,
      isCore: false,
      priority: 7,
      isPopular: true,
      estimatedSetupTime: 30,
    },

    // Customer modules
    {
      id: 'customer-list',
      title: 'Customer Management',
      description: 'Manage customer profiles and purchase history',
      icon: 'users',
      route: '/customers',
      component: 'CustomerList',
      requiredFeatures: ['customer-management'],
      category: ModuleCategory.CUSTOMERS,
      isCore: true,
      priority: 8,
    },
    {
      id: 'loyalty-program',
      title: 'Loyalty Program',
      description: 'Manage customer loyalty points and rewards',
      icon: 'star',
      route: '/customers/loyalty',
      component: 'LoyaltyProgram',
      requiredFeatures: ['loyalty-program'],
      category: ModuleCategory.CUSTOMERS,
      isCore: false,
      priority: 9,
      isPopular: true,
      estimatedSetupTime: 25,
    },
    {
      id: 'advanced-crm',
      title: 'Advanced CRM',
      description: 'Customer segmentation and marketing campaigns',
      icon: 'target',
      route: '/customers/crm',
      component: 'AdvancedCRM',
      requiredFeatures: ['advanced-crm'],
      category: ModuleCategory.CUSTOMERS,
      isCore: false,
      priority: 10,
      estimatedSetupTime: 45,
    },

    // Employee modules
    {
      id: 'employee-management',
      title: 'Employee Management',
      description: 'Manage employee profiles and roles',
      icon: 'user-tie',
      route: '/employees',
      component: 'EmployeeManagement',
      requiredFeatures: ['employee-management'],
      category: ModuleCategory.EMPLOYEES,
      isCore: false,
      priority: 11,
      estimatedSetupTime: 20,
    },
    {
      id: 'time-tracking',
      title: 'Time Tracking',
      description: 'Track employee hours and attendance',
      icon: 'clock',
      route: '/employees/time-tracking',
      component: 'TimeTracking',
      requiredFeatures: ['time-tracking'],
      category: ModuleCategory.EMPLOYEES,
      isCore: false,
      priority: 12,
      estimatedSetupTime: 15,
    },
    {
      id: 'payroll-management',
      title: 'Payroll Management',
      description: 'Process payroll and manage compensation',
      icon: 'money-bill-wave',
      route: '/employees/payroll',
      component: 'PayrollManagement',
      requiredFeatures: ['payroll-management'],
      category: ModuleCategory.EMPLOYEES,
      isCore: false,
      priority: 13,
      estimatedSetupTime: 60,
    },

    // Financial modules
    {
      id: 'financial-overview',
      title: 'Financial Overview',
      description: 'View financial performance and key metrics',
      icon: 'chart-line',
      route: '/financial',
      component: 'FinancialOverview',
      requiredFeatures: ['basic-reporting'],
      category: ModuleCategory.FINANCIAL,
      isCore: true,
      priority: 14,
    },
    {
      id: 'financial-management',
      title: 'Financial Management',
      description: 'Complete accounting and financial reporting',
      icon: 'calculator',
      route: '/financial/management',
      component: 'FinancialManagement',
      requiredFeatures: ['financial-management'],
      category: ModuleCategory.FINANCIAL,
      isCore: false,
      priority: 15,
      estimatedSetupTime: 40,
    },

    // Analytics modules
    {
      id: 'basic-analytics',
      title: 'Basic Analytics',
      description: 'Basic sales and inventory analytics',
      icon: 'chart-bar',
      route: '/analytics/basic',
      component: 'BasicAnalytics',
      requiredFeatures: ['basic-reporting'],
      category: ModuleCategory.ANALYTICS,
      isCore: false,
      priority: 16,
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Predictive analytics and business intelligence',
      icon: 'brain',
      route: '/analytics/advanced',
      component: 'AdvancedAnalytics',
      requiredFeatures: ['advanced-analytics'],
      category: ModuleCategory.ANALYTICS,
      isCore: false,
      priority: 17,
      isNew: true,
      estimatedSetupTime: 30,
    },

    // Integration modules
    {
      id: 'api-access',
      title: 'API Access',
      description: 'Manage API keys and integrations',
      icon: 'plug',
      route: '/integrations/api',
      component: 'APIAccess',
      requiredFeatures: ['api-access'],
      category: ModuleCategory.INTEGRATIONS,
      isCore: false,
      priority: 18,
      estimatedSetupTime: 10,
    },
    {
      id: 'advanced-integrations',
      title: 'Advanced Integrations',
      description: 'Pre-built connectors and advanced features',
      icon: 'network-wired',
      route: '/integrations/advanced',
      component: 'AdvancedIntegrations',
      requiredFeatures: ['advanced-integrations'],
      category: ModuleCategory.INTEGRATIONS,
      isCore: false,
      priority: 19,
      estimatedSetupTime: 25,
    },

    // Settings modules
    {
      id: 'general-settings',
      title: 'General Settings',
      description: 'Configure general business settings',
      icon: 'cog',
      route: '/settings/general',
      component: 'GeneralSettings',
      requiredFeatures: ['basic-reporting'], // Everyone should have access to settings
      category: ModuleCategory.SETTINGS,
      isCore: true,
      priority: 20,
    },
  ];

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly realTimePermissionService: RealTimePermissionService,
    private readonly cacheService: IntelligentCacheService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLoggerService,
  ) {}

  /**
   * Get dashboard configuration for a tenant/user
   */
  async getDashboardConfiguration(
    tenantId: string,
    userId?: string,
  ): Promise<DashboardConfiguration> {
    const cacheKey = this.buildCacheKey(tenantId, userId);
    
    // Check cache first
    const cached = await this.cacheService.get<DashboardConfiguration>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get tenant's available features
      const { available, upgradeRequired } = await this.featureFlagService.getAvailableFeatures(tenantId);
      const availableFeatureNames = new Set(available.map(f => f.name));

      // Filter modules based on feature access
      const availableModules: DashboardModule[] = [];
      const lockedModules: DashboardModule[] = [];

      for (const module of this.DASHBOARD_MODULES) {
        const hasAllRequiredFeatures = module.requiredFeatures.every(
          feature => availableFeatureNames.has(feature)
        );

        if (hasAllRequiredFeatures) {
          availableModules.push(module);
        } else {
          lockedModules.push(module);
        }
      }

      // Generate upgrade prompts
      const upgradePrompts = this.generateUpgradePrompts(lockedModules, upgradeRequired);

      // Get customizations (placeholder - would come from database)
      const customizations = await this.getDashboardCustomizations(tenantId, userId);

      // Determine current tier
      const tier = available.length > 0 ? BusinessTier.MICRO : BusinessTier.MICRO; // Simplified

      const configuration: DashboardConfiguration = {
        tenantId,
        ...(userId ? { userId } : {}),
        availableModules: availableModules.sort((a, b) => a.priority - b.priority),
        lockedModules: lockedModules.sort((a, b) => a.priority - b.priority),
        upgradePrompts,
        customizations,
        tier,
        generatedAt: new Date(),
      };

      // Cache the configuration
      await this.cacheService.set(cacheKey, configuration, { ttl: this.CACHE_TTL });

      this.logger.debug(`Generated dashboard configuration for tenant ${tenantId}`, {
        tenantId,
        userId,
        availableModules: availableModules.length,
        lockedModules: lockedModules.length,
        upgradePrompts: upgradePrompts.length,
      });

      return configuration;
    } catch (error) {
      this.logger.error(
        `Failed to generate dashboard configuration for tenant ${tenantId}`,
        (error as Error).stack,
        { tenantId, userId }
      );
      
      // Return minimal configuration on error
      return {
        tenantId,
        ...(userId ? { userId } : {}),
        availableModules: this.DASHBOARD_MODULES.filter(m => m.isCore).slice(0, 3),
        lockedModules: [],
        upgradePrompts: [],
        customizations: [],
        tier: BusinessTier.MICRO,
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Get modules by category
   */
  async getModulesByCategory(
    tenantId: string,
    category: ModuleCategory,
    userId?: string,
  ): Promise<{
    available: DashboardModule[];
    locked: DashboardModule[];
  }> {
    const configuration = await this.getDashboardConfiguration(tenantId, userId);
    
    return {
      available: configuration.availableModules.filter(m => m.category === category),
      locked: configuration.lockedModules.filter(m => m.category === category),
    };
  }

  /**
   * Get upgrade prompts for locked features
   */
  async getUpgradePrompts(
    tenantId: string,
    userId?: string,
    priority?: 'low' | 'medium' | 'high',
  ): Promise<UpgradePrompt[]> {
    const configuration = await this.getDashboardConfiguration(tenantId, userId);
    
    let prompts = configuration.upgradePrompts;
    
    if (priority) {
      prompts = prompts.filter(p => p.priority === priority);
    }
    
    return prompts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Update dashboard customizations
   */
  async updateDashboardCustomizations(
    tenantId: string,
    customizations: DashboardCustomization[],
    userId?: string,
  ): Promise<void> {
    // In a real implementation, this would save to database
    // For now, we'll just invalidate the cache
    await this.invalidateDashboardCache(tenantId, userId);
    
    this.logger.log(`Updated dashboard customizations for tenant ${tenantId}`, {
      tenantId,
      userId,
      customizationCount: customizations.length,
    });

    // Emit event for real-time updates
    this.eventEmitter.emit('dashboard.customizations.updated', {
      tenantId,
      userId,
      customizations,
      timestamp: new Date(),
    });
  }

  /**
   * Get dashboard performance metrics
   */
  async getDashboardMetrics(tenantId: string): Promise<{
    totalModules: number;
    availableModules: number;
    lockedModules: number;
    utilizationRate: number;
    popularModules: string[];
    setupProgress: number;
  }> {
    const configuration = await this.getDashboardConfiguration(tenantId);
    
    const totalModules = this.DASHBOARD_MODULES.length;
    const availableModules = configuration.availableModules.length;
    const lockedModules = configuration.lockedModules.length;
    const utilizationRate = availableModules / totalModules;
    
    // Get popular modules (simplified)
    const popularModules = configuration.availableModules
      .filter(m => m.isPopular)
      .map(m => m.id);
    
    // Calculate setup progress (simplified)
    const coreModulesAvailable = configuration.availableModules.filter(m => m.isCore).length;
    const totalCoreModules = this.DASHBOARD_MODULES.filter(m => m.isCore).length;
    const setupProgress = coreModulesAvailable / totalCoreModules;
    
    return {
      totalModules,
      availableModules,
      lockedModules,
      utilizationRate,
      popularModules,
      setupProgress,
    };
  }

  /**
   * Invalidate dashboard cache
   */
  async invalidateDashboardCache(tenantId: string, userId?: string): Promise<void> {
    const pattern = userId 
      ? `${this.CACHE_PREFIX}:${tenantId}:${userId}`
      : `${this.CACHE_PREFIX}:${tenantId}:*`;
    
    await this.cacheService.invalidatePattern(pattern);
    
    this.logger.debug(`Invalidated dashboard cache`, { tenantId, userId, pattern });
  }

  /**
   * Preload dashboard configuration
   */
  async preloadDashboardConfiguration(tenantId: string, userId?: string): Promise<void> {
    try {
      await this.getDashboardConfiguration(tenantId, userId);
      this.logger.debug(`Preloaded dashboard configuration for tenant ${tenantId}`, { tenantId, userId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to preload dashboard configuration for tenant ${tenantId}: ${errorMessage}`,
        { tenantId, userId }
      );
    }
  }

  /**
   * Generate upgrade prompts based on locked modules
   */
  private generateUpgradePrompts(
    lockedModules: DashboardModule[],
    upgradeRequiredFeatures: FeatureDefinition[],
  ): UpgradePrompt[] {
    const prompts: UpgradePrompt[] = [];
    const featureToTierMap = new Map<string, BusinessTier>();
    
    // Build feature to tier mapping
    upgradeRequiredFeatures.forEach(feature => {
      featureToTierMap.set(feature.name, feature.requiredTier);
    });

    // Group locked modules by required tier
    const modulesByTier = new Map<BusinessTier, DashboardModule[]>();
    
    lockedModules.forEach(module => {
      const requiredTiers = module.requiredFeatures
        .map(feature => featureToTierMap.get(feature))
        .filter(tier => tier !== undefined) as BusinessTier[];
      
      if (requiredTiers.length > 0) {
        const highestTier = this.getHighestTier(requiredTiers);
        const existing = modulesByTier.get(highestTier) || [];
        existing.push(module);
        modulesByTier.set(highestTier, existing);
      }
    });

    // Generate prompts for each tier
    modulesByTier.forEach((modules, tier) => {
      const popularModules = modules.filter(m => m.isPopular || m.isNew);
      const modulesToHighlight = popularModules.length > 0 ? popularModules : modules.slice(0, 3);
      
      prompts.push({
        id: `upgrade-to-${tier.toLowerCase()}`,
        title: `Unlock ${modulesToHighlight.length} Premium Features`,
        description: `Upgrade to ${tier} to access ${modulesToHighlight.map(m => m.title).join(', ')} and more.`,
        ctaText: `Upgrade to ${tier}`,
        ctaUrl: `/pricing?tier=${tier.toLowerCase()}`,
        requiredTier: tier,
        features: modules.flatMap(m => m.requiredFeatures),
        priority: this.getTierPriority(tier),
        dismissible: true,
        showAfterDays: tier === BusinessTier.ENTERPRISE ? 7 : 3,
      });
    });

    return prompts;
  }

  /**
   * Get dashboard customizations (placeholder)
   */
  private async getDashboardCustomizations(
    tenantId: string,
    userId?: string,
  ): Promise<DashboardCustomization[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  /**
   * Get the highest tier from a list of tiers
   */
  private getHighestTier(tiers: BusinessTier[]): BusinessTier {
    const tierOrder = [BusinessTier.MICRO, BusinessTier.SMALL, BusinessTier.MEDIUM, BusinessTier.ENTERPRISE];
    let highestIndex = -1;
    
    tiers.forEach(tier => {
      const index = tierOrder.indexOf(tier);
      if (index > highestIndex) {
        highestIndex = index;
      }
    });
    
    return tierOrder[highestIndex] || BusinessTier.MICRO;
  }

  /**
   * Get priority for tier-based prompts
   */
  private getTierPriority(tier: BusinessTier): 'low' | 'medium' | 'high' {
    switch (tier) {
      case BusinessTier.SMALL:
        return 'high';
      case BusinessTier.MEDIUM:
        return 'medium';
      case BusinessTier.ENTERPRISE:
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Build cache key for dashboard configuration
   */
  private buildCacheKey(tenantId: string, userId?: string): string {
    return userId 
      ? `${this.CACHE_PREFIX}:${tenantId}:${userId}`
      : `${this.CACHE_PREFIX}:${tenantId}:tenant`;
  }
}