/**
 * Permission Validation Service
 * Comprehensive permission validation system with tier hierarchy and GraphQL operation validation
 * Requirements: 10.3, 10.4, 10.5
 */

import { apolloClient } from '@/lib/apollo/client';
import { permissionsManager } from './permissions-manager';
import { BusinessTier } from '@/hooks/useTierAccess';
import { GraphQLIntegrationService } from './GraphQLIntegrationService';

export interface PermissionValidationResult {
  hasAccess: boolean;
  reason?: string;
  requiredTier?: BusinessTier;
  requiredPermissions?: string[];
  conflictResolution?: ConflictResolution;
}

export interface ConflictResolution {
  resolvedBy: 'tier' | 'permission' | 'hierarchy';
  originalConflict: string;
  resolution: string;
}

export interface FeaturePermissionConfig {
  featureId: string;
  requiredPermissions: string[];
  requiredTier?: BusinessTier;
  fallbackPermissions?: string[];
  allowTierOverride?: boolean;
}

export interface GraphQLOperationConfig {
  operationName: string;
  operationType: 'query' | 'mutation' | 'subscription';
  requiredPermissions: string[];
  requiredTier?: BusinessTier;
  resourcePermissions?: {
    resource: string;
    action: string;
  };
}

/**
 * Tier hierarchy levels for conflict resolution
 */
const TIER_HIERARCHY: Record<BusinessTier, number> = {
  [BusinessTier.MICRO]: 0,
  [BusinessTier.SMALL]: 1,
  [BusinessTier.MEDIUM]: 2,
  [BusinessTier.ENTERPRISE]: 3,
};

/**
 * Permission Validation Service
 * Handles comprehensive permission checking with tier hierarchy resolution
 */
export class PermissionValidationService {
  private graphqlService: GraphQLIntegrationService;
  private featurePermissionCache = new Map<string, FeaturePermissionConfig>();
  private operationPermissionCache = new Map<string, GraphQLOperationConfig>();
  private userTierCache = new Map<string, { tier: BusinessTier; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.graphqlService = new GraphQLIntegrationService(apolloClient);
    this.initializeFeaturePermissions();
    this.initializeOperationPermissions();
  }

  /**
   * Initialize feature permission configurations
   */
  private initializeFeaturePermissions(): void {
    const features: FeaturePermissionConfig[] = [
      // Core features
      {
        featureId: 'dashboard',
        requiredPermissions: ['dashboard:view'],
        requiredTier: BusinessTier.MICRO,
      },
      {
        featureId: 'inventory',
        requiredPermissions: ['inventory:view'],
        requiredTier: BusinessTier.MICRO,
      },
      {
        featureId: 'pos',
        requiredPermissions: ['pos:access'],
        requiredTier: BusinessTier.MICRO,
      },
      
      // Small tier features
      {
        featureId: 'crm',
        requiredPermissions: ['crm:access'],
        requiredTier: BusinessTier.SMALL,
        fallbackPermissions: ['customer:view'],
      },
      {
        featureId: 'analytics',
        requiredPermissions: ['analytics:view'],
        requiredTier: BusinessTier.SMALL,
      },
      {
        featureId: 'reports',
        requiredPermissions: ['reports:view'],
        requiredTier: BusinessTier.SMALL,
      },
      
      // Medium tier features
      {
        featureId: 'advanced_analytics',
        requiredPermissions: ['analytics:advanced'],
        requiredTier: BusinessTier.MEDIUM,
      },
      {
        featureId: 'multi_location',
        requiredPermissions: ['location:manage_multiple'],
        requiredTier: BusinessTier.MEDIUM,
      },
      {
        featureId: 'employee_management',
        requiredPermissions: ['employee:manage'],
        requiredTier: BusinessTier.MEDIUM,
      },
      
      // Enterprise features
      {
        featureId: 'api_access',
        requiredPermissions: ['api:access'],
        requiredTier: BusinessTier.ENTERPRISE,
      },
      {
        featureId: 'custom_integrations',
        requiredPermissions: ['integration:custom'],
        requiredTier: BusinessTier.ENTERPRISE,
      },
      {
        featureId: 'advanced_security',
        requiredPermissions: ['security:advanced'],
        requiredTier: BusinessTier.ENTERPRISE,
      },
    ];

    features.forEach(feature => {
      this.featurePermissionCache.set(feature.featureId, feature);
    });
  }

  /**
   * Initialize GraphQL operation permission configurations
   */
  private initializeOperationPermissions(): void {
    const operations: GraphQLOperationConfig[] = [
      // Authentication operations
      {
        operationName: 'login',
        operationType: 'mutation',
        requiredPermissions: [],
      },
      {
        operationName: 'logout',
        operationType: 'mutation',
        requiredPermissions: [],
      },
      {
        operationName: 'me',
        operationType: 'query',
        requiredPermissions: ['user:view_self'],
      },
      
      // Permission operations
      {
        operationName: 'getMyPermissions',
        operationType: 'query',
        requiredPermissions: ['permission:view_self'],
      },
      {
        operationName: 'grantPermission',
        operationType: 'mutation',
        requiredPermissions: ['permission:grant'],
        requiredTier: BusinessTier.MEDIUM,
      },
      {
        operationName: 'revokePermission',
        operationType: 'mutation',
        requiredPermissions: ['permission:revoke'],
        requiredTier: BusinessTier.MEDIUM,
      },
      
      // Tier operations
      {
        operationName: 'updateTier',
        operationType: 'mutation',
        requiredPermissions: ['tier:update'],
        requiredTier: BusinessTier.SMALL,
      },
      {
        operationName: 'getMyTier',
        operationType: 'query',
        requiredPermissions: ['tier:view_self'],
      },
      
      // Feature-specific operations
      {
        operationName: 'advancedReports',
        operationType: 'query',
        requiredPermissions: ['reports:advanced'],
        requiredTier: BusinessTier.MEDIUM,
      },
      {
        operationName: 'multiLocationData',
        operationType: 'query',
        requiredPermissions: ['location:view_multiple'],
        requiredTier: BusinessTier.MEDIUM,
      },
      {
        operationName: 'enterpriseFeature',
        operationType: 'query',
        requiredPermissions: ['enterprise:access'],
        requiredTier: BusinessTier.ENTERPRISE,
      },
    ];

    operations.forEach(operation => {
      this.operationPermissionCache.set(operation.operationName, operation);
    });
  }

  /**
   * Validate permission for feature rendering
   * Requirement 10.3: Permission checking before feature rendering
   */
  async validateFeatureAccess(
    featureId: string,
    userId?: string
  ): Promise<PermissionValidationResult> {
    const featureConfig = this.featurePermissionCache.get(featureId);
    
    if (!featureConfig) {
      return {
        hasAccess: false,
        reason: `Unknown feature: ${featureId}`,
      };
    }

    try {
      // Get user's current tier
      const userTier = await this.getUserTier(userId);
      
      // Get user's permissions
      const userPermissions = userId 
        ? await permissionsManager.getPermissions(userId)
        : await permissionsManager.getMyPermissions();

      // Check tier requirement first
      if (featureConfig.requiredTier && !this.meetsTierRequirement(userTier, featureConfig.requiredTier)) {
        // Check if user has override permissions
        if (!featureConfig.allowTierOverride || !this.hasRequiredPermissions(userPermissions, featureConfig.requiredPermissions)) {
          return {
            hasAccess: false,
            reason: `Requires ${featureConfig.requiredTier} tier or higher`,
            requiredTier: featureConfig.requiredTier,
            requiredPermissions: featureConfig.requiredPermissions,
          };
        }
      }

      // Check permission requirements
      const hasPermissions = this.hasRequiredPermissions(userPermissions, featureConfig.requiredPermissions);
      
      if (!hasPermissions && featureConfig.fallbackPermissions) {
        const hasFallbackPermissions = this.hasRequiredPermissions(userPermissions, featureConfig.fallbackPermissions);
        
        if (hasFallbackPermissions) {
          return {
            hasAccess: true,
            conflictResolution: {
              resolvedBy: 'permission',
              originalConflict: `Missing ${featureConfig.requiredPermissions.join(', ')}`,
              resolution: `Granted via fallback permissions: ${featureConfig.fallbackPermissions.join(', ')}`,
            },
          };
        }
      }

      if (!hasPermissions) {
        return {
          hasAccess: false,
          reason: `Missing required permissions: ${featureConfig.requiredPermissions.join(', ')}`,
          requiredPermissions: featureConfig.requiredPermissions,
        };
      }

      return { hasAccess: true };
    } catch (error) {
      console.error('Feature access validation failed:', error);
      return {
        hasAccess: false,
        reason: 'Validation error occurred',
      };
    }
  }

  /**
   * Validate permission for GraphQL operations
   * Requirement 10.4: GraphQL operation permission validation
   */
  async validateGraphQLOperation(
    operationName: string,
    userId?: string,
    variables?: any
  ): Promise<PermissionValidationResult> {
    const operationConfig = this.operationPermissionCache.get(operationName);
    
    if (!operationConfig) {
      // Allow unknown operations by default (they may have their own guards)
      return { hasAccess: true };
    }

    try {
      // Skip validation for public operations
      if (operationConfig.requiredPermissions.length === 0) {
        return { hasAccess: true };
      }

      // Get user's current tier
      const userTier = await this.getUserTier(userId);
      
      // Get user's permissions
      const userPermissions = userId 
        ? await permissionsManager.getPermissions(userId)
        : await permissionsManager.getMyPermissions();

      // Check tier requirement
      if (operationConfig.requiredTier && !this.meetsTierRequirement(userTier, operationConfig.requiredTier)) {
        return {
          hasAccess: false,
          reason: `Operation requires ${operationConfig.requiredTier} tier or higher`,
          requiredTier: operationConfig.requiredTier,
        };
      }

      // Check permission requirements
      const hasPermissions = this.hasRequiredPermissions(userPermissions, operationConfig.requiredPermissions);
      
      if (!hasPermissions) {
        return {
          hasAccess: false,
          reason: `Missing required permissions for ${operationName}: ${operationConfig.requiredPermissions.join(', ')}`,
          requiredPermissions: operationConfig.requiredPermissions,
        };
      }

      // Check resource-specific permissions if specified
      if (operationConfig.resourcePermissions && variables) {
        const resourcePermission = `${operationConfig.resourcePermissions.resource}:${operationConfig.resourcePermissions.action}`;
        const hasResourcePermission = this.hasRequiredPermissions(userPermissions, [resourcePermission]);
        
        if (!hasResourcePermission) {
          return {
            hasAccess: false,
            reason: `Missing resource permission: ${resourcePermission}`,
            requiredPermissions: [resourcePermission],
          };
        }
      }

      return { hasAccess: true };
    } catch (error) {
      console.error('GraphQL operation validation failed:', error);
      return {
        hasAccess: false,
        reason: 'Validation error occurred',
      };
    }
  }

  /**
   * Resolve permission conflicts with tier hierarchy
   * Requirement 10.5: Permission conflict resolution with tier hierarchy
   */
  async resolvePermissionConflict(
    userId: string,
    conflictingPermissions: string[],
    requestedAction: string
  ): Promise<PermissionValidationResult> {
    try {
      // Get user's current tier and permissions
      const [userTier, userPermissions] = await Promise.all([
        this.getUserTier(userId),
        permissionsManager.getPermissions(userId),
      ]);

      // Check if tier hierarchy can resolve the conflict
      const tierResolution = await this.resolveThroughTierHierarchy(
        userTier,
        conflictingPermissions,
        requestedAction
      );

      if (tierResolution.hasAccess) {
        return tierResolution;
      }

      // Check if wildcard permissions can resolve the conflict
      const wildcardResolution = this.resolveThroughWildcardPermissions(
        userPermissions,
        conflictingPermissions
      );

      if (wildcardResolution.hasAccess) {
        return wildcardResolution;
      }

      // Check if inherited permissions can resolve the conflict
      const inheritedResolution = await this.resolveThroughInheritedPermissions(
        userId,
        conflictingPermissions
      );

      if (inheritedResolution.hasAccess) {
        return inheritedResolution;
      }

      // No resolution found
      return {
        hasAccess: false,
        reason: `Cannot resolve permission conflict for: ${conflictingPermissions.join(', ')}`,
        requiredPermissions: conflictingPermissions,
      };
    } catch (error) {
      console.error('Permission conflict resolution failed:', error);
      return {
        hasAccess: false,
        reason: 'Conflict resolution error occurred',
      };
    }
  }

  /**
   * Get user's current tier with caching
   */
  private async getUserTier(userId?: string): Promise<BusinessTier> {
    const cacheKey = userId || 'current_user';
    const cached = this.userTierCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.tier;
    }

    try {
      const result = await this.graphqlService.getMyTier();
      const tier = result.data?.tier || BusinessTier.MICRO;
      
      this.userTierCache.set(cacheKey, {
        tier,
        timestamp: Date.now(),
      });
      
      return tier;
    } catch (error) {
      console.error('Failed to get user tier:', error);
      return BusinessTier.MICRO; // Default to lowest tier
    }
  }

  /**
   * Check if user meets tier requirement
   */
  private meetsTierRequirement(userTier: BusinessTier, requiredTier: BusinessTier): boolean {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  }

  /**
   * Check if user has required permissions (with wildcard support)
   */
  private hasRequiredPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(required => 
      userPermissions.some(userPerm => {
        // Exact match
        if (userPerm === required) return true;
        
        // Wildcard match
        if (userPerm.endsWith(':*')) {
          const prefix = userPerm.slice(0, -1);
          return required.startsWith(prefix);
        }
        
        return false;
      })
    );
  }

  /**
   * Resolve conflicts through tier hierarchy
   */
  private async resolveThroughTierHierarchy(
    userTier: BusinessTier,
    conflictingPermissions: string[],
    requestedAction: string
  ): Promise<PermissionValidationResult> {
    // Define tier-based permission overrides
    const tierOverrides: Record<BusinessTier, string[]> = {
      [BusinessTier.MICRO]: [],
      [BusinessTier.SMALL]: ['reports:basic', 'analytics:basic'],
      [BusinessTier.MEDIUM]: ['reports:advanced', 'analytics:advanced', 'employee:manage'],
      [BusinessTier.ENTERPRISE]: ['*:*'], // Enterprise has access to everything
    };

    const userTierOverrides = tierOverrides[userTier];
    
    // Check if tier provides override for conflicting permissions
    const hasOverride = conflictingPermissions.some(permission => 
      userTierOverrides.some(override => {
        if (override === '*:*') return true;
        if (override === permission) return true;
        if (override.endsWith(':*')) {
          const prefix = override.slice(0, -1);
          return permission.startsWith(prefix);
        }
        return false;
      })
    );

    if (hasOverride) {
      return {
        hasAccess: true,
        conflictResolution: {
          resolvedBy: 'tier',
          originalConflict: `Missing permissions: ${conflictingPermissions.join(', ')}`,
          resolution: `Granted via ${userTier} tier hierarchy`,
        },
      };
    }

    return { hasAccess: false };
  }

  /**
   * Resolve conflicts through wildcard permissions
   */
  private resolveThroughWildcardPermissions(
    userPermissions: string[],
    conflictingPermissions: string[]
  ): PermissionValidationResult {
    const wildcardPermissions = userPermissions.filter(perm => perm.includes('*'));
    
    if (wildcardPermissions.length === 0) {
      return { hasAccess: false };
    }

    const resolvedPermissions = conflictingPermissions.filter(required => 
      wildcardPermissions.some(wildcard => {
        if (wildcard === '*:*') return true;
        if (wildcard.endsWith(':*')) {
          const prefix = wildcard.slice(0, -1);
          return required.startsWith(prefix);
        }
        return false;
      })
    );

    if (resolvedPermissions.length === conflictingPermissions.length) {
      return {
        hasAccess: true,
        conflictResolution: {
          resolvedBy: 'permission',
          originalConflict: `Missing permissions: ${conflictingPermissions.join(', ')}`,
          resolution: `Granted via wildcard permissions: ${wildcardPermissions.join(', ')}`,
        },
      };
    }

    return { hasAccess: false };
  }

  /**
   * Resolve conflicts through inherited permissions
   */
  private async resolveThroughInheritedPermissions(
    userId: string,
    conflictingPermissions: string[]
  ): Promise<PermissionValidationResult> {
    try {
      const detailedPermissions = await permissionsManager.getDetailedPermissions(userId);
      const inheritedPermissions = detailedPermissions.detailedPermissions
        .filter(perm => perm.isInherited)
        .map(perm => perm.permission);

      const hasInheritedPermissions = this.hasRequiredPermissions(inheritedPermissions, conflictingPermissions);

      if (hasInheritedPermissions) {
        return {
          hasAccess: true,
          conflictResolution: {
            resolvedBy: 'hierarchy',
            originalConflict: `Missing permissions: ${conflictingPermissions.join(', ')}`,
            resolution: `Granted via inherited permissions from role: ${detailedPermissions.role}`,
          },
        };
      }

      return { hasAccess: false };
    } catch (error) {
      console.error('Failed to resolve through inherited permissions:', error);
      return { hasAccess: false };
    }
  }

  /**
   * Add or update feature permission configuration
   */
  addFeaturePermission(config: FeaturePermissionConfig): void {
    this.featurePermissionCache.set(config.featureId, config);
  }

  /**
   * Add or update GraphQL operation permission configuration
   */
  addOperationPermission(config: GraphQLOperationConfig): void {
    this.operationPermissionCache.set(config.operationName, config);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.userTierCache.clear();
    permissionsManager.clearCache();
  }

  /**
   * Get feature permission configuration
   */
  getFeatureConfig(featureId: string): FeaturePermissionConfig | undefined {
    return this.featurePermissionCache.get(featureId);
  }

  /**
   * Get operation permission configuration
   */
  getOperationConfig(operationName: string): GraphQLOperationConfig | undefined {
    return this.operationPermissionCache.get(operationName);
  }
}

// Export singleton instance
export const permissionValidationService = new PermissionValidationService();