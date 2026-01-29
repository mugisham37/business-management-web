/**
 * TierAssignmentService - Tier assignment logic with permission mapping
 */

import { BusinessTier } from '@/hooks/useOnboarding';
import { ApolloClient } from '@apollo/client';

/**
 * Permission mapping for each tier
 */
export interface TierPermissions {
  tier: BusinessTier;
  permissions: string[];
  features: string[];
  limits: {
    employees: number;
    locations: number;
    transactions: number;
    storage: number; // in GB
    apiCalls: number; // per month
  };
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

/**
 * Tier assignment result
 */
export interface TierAssignmentResult {
  success: boolean;
  assignedTier: BusinessTier;
  permissions: string[];
  features: string[];
  activatedAt: Date;
  expiresAt?: Date;
  error?: string;
}

/**
 * Permission update result
 */
export interface PermissionUpdateResult {
  success: boolean;
  updatedPermissions: string[];
  addedPermissions: string[];
  removedPermissions: string[];
  error?: string;
}

export class TierAssignmentService {
  private apolloClient: ApolloClient<any>;

  // Complete permission mapping for all tiers
  private readonly tierPermissionMap: Record<BusinessTier, TierPermissions> = {
    [BusinessTier.MICRO]: {
      tier: BusinessTier.MICRO,
      permissions: [
        // Basic POS permissions
        'pos:basic:read',
        'pos:basic:write',
        'pos:transactions:create',
        'pos:transactions:read',
        
        // Basic inventory permissions
        'inventory:products:read',
        'inventory:products:write',
        'inventory:basic:manage',
        
        // Basic customer permissions
        'customers:basic:read',
        'customers:basic:write',
        'customers:profiles:manage',
        
        // Basic reporting permissions
        'reports:basic:read',
        'reports:sales:basic',
        
        // Basic settings permissions
        'settings:basic:read',
        'settings:basic:write',
        
        // Profile permissions
        'profile:read',
        'profile:write',
      ],
      features: [
        'basic-pos',
        'inventory-management',
        'customer-profiles',
        'basic-reporting',
        'community-support',
      ],
      limits: {
        employees: 5,
        locations: 1,
        transactions: 1000,
        storage: 1,
        apiCalls: 1000,
      },
      supportLevel: 'community',
    },
    [BusinessTier.SMALL]: {
      tier: BusinessTier.SMALL,
      permissions: [
        // All Micro permissions
        'pos:basic:read',
        'pos:basic:write',
        'pos:transactions:create',
        'pos:transactions:read',
        'inventory:products:read',
        'inventory:products:write',
        'inventory:basic:manage',
        'customers:basic:read',
        'customers:basic:write',
        'customers:profiles:manage',
        'reports:basic:read',
        'reports:sales:basic',
        'settings:basic:read',
        'settings:basic:write',
        'profile:read',
        'profile:write',
        
        // Additional Small tier permissions
        'pos:advanced:read',
        'pos:advanced:write',
        'pos:multi-location:manage',
        
        'inventory:advanced:read',
        'inventory:advanced:write',
        'inventory:tracking:manage',
        'inventory:alerts:manage',
        
        'customers:loyalty:read',
        'customers:loyalty:write',
        'customers:loyalty:manage',
        
        'reports:advanced:read',
        'reports:analytics:basic',
        'reports:export:basic',
        
        'integrations:api:read',
        'integrations:api:write',
        'integrations:webhooks:manage',
        
        'notifications:email:manage',
        'notifications:basic:send',
        
        'locations:multi:read',
        'locations:multi:write',
        'locations:multi:manage',
      ],
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'email-support',
      ],
      limits: {
        employees: 25,
        locations: 5,
        transactions: 10000,
        storage: 10,
        apiCalls: 10000,
      },
      supportLevel: 'email',
    },
    [BusinessTier.MEDIUM]: {
      tier: BusinessTier.MEDIUM,
      permissions: [
        // All Small tier permissions
        'pos:basic:read',
        'pos:basic:write',
        'pos:transactions:create',
        'pos:transactions:read',
        'pos:advanced:read',
        'pos:advanced:write',
        'pos:multi-location:manage',
        'inventory:products:read',
        'inventory:products:write',
        'inventory:basic:manage',
        'inventory:advanced:read',
        'inventory:advanced:write',
        'inventory:tracking:manage',
        'inventory:alerts:manage',
        'customers:basic:read',
        'customers:basic:write',
        'customers:profiles:manage',
        'customers:loyalty:read',
        'customers:loyalty:write',
        'customers:loyalty:manage',
        'reports:basic:read',
        'reports:sales:basic',
        'reports:advanced:read',
        'reports:analytics:basic',
        'reports:export:basic',
        'settings:basic:read',
        'settings:basic:write',
        'profile:read',
        'profile:write',
        'integrations:api:read',
        'integrations:api:write',
        'integrations:webhooks:manage',
        'notifications:email:manage',
        'notifications:basic:send',
        'locations:multi:read',
        'locations:multi:write',
        'locations:multi:manage',
        
        // Additional Medium tier permissions
        'b2b:operations:read',
        'b2b:operations:write',
        'b2b:operations:manage',
        'b2b:customers:manage',
        'b2b:pricing:manage',
        'b2b:quotes:read',
        'b2b:quotes:write',
        'b2b:quotes:manage',
        
        'financial:management:read',
        'financial:management:write',
        'financial:accounting:basic',
        'financial:reports:advanced',
        
        'analytics:advanced:read',
        'analytics:predictive:basic',
        'analytics:custom:create',
        
        'integrations:sso:read',
        'integrations:sso:write',
        'integrations:advanced:manage',
        
        'users:management:read',
        'users:management:write',
        'users:roles:manage',
        'users:permissions:manage',
        
        'support:priority:access',
      ],
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'b2b-operations',
        'financial-management',
        'quote-management',
        'sso-integration',
        'user-management',
        'priority-support',
      ],
      limits: {
        employees: 100,
        locations: 20,
        transactions: 50000,
        storage: 100,
        apiCalls: 100000,
      },
      supportLevel: 'priority',
    },
    [BusinessTier.ENTERPRISE]: {
      tier: BusinessTier.ENTERPRISE,
      permissions: [
        // All Medium tier permissions plus enterprise-specific ones
        'pos:basic:read',
        'pos:basic:write',
        'pos:transactions:create',
        'pos:transactions:read',
        'pos:advanced:read',
        'pos:advanced:write',
        'pos:multi-location:manage',
        'inventory:products:read',
        'inventory:products:write',
        'inventory:basic:manage',
        'inventory:advanced:read',
        'inventory:advanced:write',
        'inventory:tracking:manage',
        'inventory:alerts:manage',
        'customers:basic:read',
        'customers:basic:write',
        'customers:profiles:manage',
        'customers:loyalty:read',
        'customers:loyalty:write',
        'customers:loyalty:manage',
        'reports:basic:read',
        'reports:sales:basic',
        'reports:advanced:read',
        'reports:analytics:basic',
        'reports:export:basic',
        'settings:basic:read',
        'settings:basic:write',
        'profile:read',
        'profile:write',
        'integrations:api:read',
        'integrations:api:write',
        'integrations:webhooks:manage',
        'notifications:email:manage',
        'notifications:basic:send',
        'locations:multi:read',
        'locations:multi:write',
        'locations:multi:manage',
        'b2b:operations:read',
        'b2b:operations:write',
        'b2b:operations:manage',
        'b2b:customers:manage',
        'b2b:pricing:manage',
        'b2b:quotes:read',
        'b2b:quotes:write',
        'b2b:quotes:manage',
        'financial:management:read',
        'financial:management:write',
        'financial:accounting:basic',
        'financial:reports:advanced',
        'analytics:advanced:read',
        'analytics:predictive:basic',
        'analytics:custom:create',
        'integrations:sso:read',
        'integrations:sso:write',
        'integrations:advanced:manage',
        'users:management:read',
        'users:management:write',
        'users:roles:manage',
        'users:permissions:manage',
        'support:priority:access',
        
        // Enterprise-specific permissions
        'warehouse:management:read',
        'warehouse:management:write',
        'warehouse:management:full',
        'warehouse:zones:manage',
        'warehouse:picking:manage',
        
        'analytics:predictive:advanced',
        'analytics:ai:access',
        'analytics:custom:advanced',
        'analytics:data-warehouse:access',
        
        'integrations:enterprise:read',
        'integrations:enterprise:write',
        'integrations:custom:develop',
        'integrations:api:unlimited',
        
        'security:advanced:read',
        'security:advanced:write',
        'security:audit:full',
        'security:compliance:manage',
        
        'support:dedicated:access',
        'support:sla:custom',
        
        'admin:system:read',
        'admin:system:write',
        'admin:tenant:manage',
        'admin:billing:manage',
        
        'whitelabel:access',
        'whitelabel:customize',
      ],
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'b2b-operations',
        'financial-management',
        'quote-management',
        'sso-integration',
        'user-management',
        'warehouse-management',
        'predictive-analytics',
        'dedicated-support',
        'custom-sla',
        'white-label-options',
        'unlimited-api',
        'advanced-security',
        'compliance-tools',
      ],
      limits: {
        employees: -1, // Unlimited
        locations: -1, // Unlimited
        transactions: -1, // Unlimited
        storage: -1, // Unlimited
        apiCalls: -1, // Unlimited
      },
      supportLevel: 'dedicated',
    },
  };

  constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
  }

  /**
   * Assign tier to user with permission mapping
   */
  async assignTier(
    userId: string,
    tier: BusinessTier,
    reason?: string
  ): Promise<TierAssignmentResult> {
    try {
      const tierPermissions = this.tierPermissionMap[tier];
      
      // Execute tier assignment mutation
      const { data } = await this.apolloClient.mutate({
        mutation: `
          mutation AssignTier($input: AssignTierInput!) {
            assignTier(input: $input) {
              success
              assignedTier
              permissions
              features
              activatedAt
              expiresAt
            }
          }
        `,
        variables: {
          input: {
            userId,
            tier,
            permissions: tierPermissions.permissions,
            features: tierPermissions.features,
            limits: tierPermissions.limits,
            reason,
          },
        },
      });

      const result = data.assignTier;

      if (result.success) {
        // Update local cache/state if needed
        await this.updateUserPermissionsCache(userId, result.permissions);
        
        return {
          success: true,
          assignedTier: result.assignedTier,
          permissions: result.permissions,
          features: result.features,
          activatedAt: new Date(result.activatedAt),
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
        };
      } else {
        return {
          success: false,
          assignedTier: tier,
          permissions: [],
          features: [],
          activatedAt: new Date(),
          error: 'Failed to assign tier',
        };
      }
    } catch (error) {
      console.error('Failed to assign tier:', error);
      return {
        success: false,
        assignedTier: tier,
        permissions: [],
        features: [],
        activatedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user permissions for tier change
   */
  async updatePermissions(
    userId: string,
    fromTier: BusinessTier,
    toTier: BusinessTier
  ): Promise<PermissionUpdateResult> {
    try {
      const fromPermissions = this.tierPermissionMap[fromTier].permissions;
      const toPermissions = this.tierPermissionMap[toTier].permissions;
      
      const addedPermissions = toPermissions.filter(p => !fromPermissions.includes(p));
      const removedPermissions = fromPermissions.filter(p => !toPermissions.includes(p));

      // Execute permission update mutation
      const { data } = await this.apolloClient.mutate({
        mutation: `
          mutation UpdateUserPermissions($input: UpdateUserPermissionsInput!) {
            updateUserPermissions(input: $input) {
              success
              updatedPermissions
              addedPermissions
              removedPermissions
            }
          }
        `,
        variables: {
          input: {
            userId,
            permissions: toPermissions,
            addedPermissions,
            removedPermissions,
          },
        },
      });

      const result = data.updateUserPermissions;

      if (result.success) {
        // Update local cache
        await this.updateUserPermissionsCache(userId, result.updatedPermissions);
        
        return {
          success: true,
          updatedPermissions: result.updatedPermissions,
          addedPermissions: result.addedPermissions,
          removedPermissions: result.removedPermissions,
        };
      } else {
        return {
          success: false,
          updatedPermissions: [],
          addedPermissions: [],
          removedPermissions: [],
          error: 'Failed to update permissions',
        };
      }
    } catch (error) {
      console.error('Failed to update permissions:', error);
      return {
        success: false,
        updatedPermissions: [],
        addedPermissions: [],
        removedPermissions: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get permissions for a specific tier
   */
  getTierPermissions(tier: BusinessTier): TierPermissions {
    return this.tierPermissionMap[tier];
  }

  /**
   * Get all tier permissions for comparison
   */
  getAllTierPermissions(): Record<BusinessTier, TierPermissions> {
    return this.tierPermissionMap;
  }

  /**
   * Check if user has permission
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Wildcard permission match (e.g., "pos:*" matches "pos:basic:read")
    return userPermissions.some(permission => {
      if (permission.endsWith(':*')) {
        const prefix = permission.slice(0, -1);
        return requiredPermission.startsWith(prefix);
      }
      return false;
    });
  }

  /**
   * Get permission differences between tiers
   */
  getPermissionDifferences(fromTier: BusinessTier, toTier: BusinessTier): {
    added: string[];
    removed: string[];
    unchanged: string[];
  } {
    const fromPermissions = this.tierPermissionMap[fromTier].permissions;
    const toPermissions = this.tierPermissionMap[toTier].permissions;

    const added = toPermissions.filter(p => !fromPermissions.includes(p));
    const removed = fromPermissions.filter(p => !toPermissions.includes(p));
    const unchanged = fromPermissions.filter(p => toPermissions.includes(p));

    return { added, removed, unchanged };
  }

  /**
   * Validate tier assignment eligibility
   */
  async validateTierEligibility(
    userId: string,
    tier: BusinessTier,
    businessData?: any
  ): Promise<{
    eligible: boolean;
    reasons: string[];
    warnings: string[];
  }> {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let eligible = true;

    // Check business data against tier limits if provided
    if (businessData) {
      const tierLimits = this.tierPermissionMap[tier].limits;
      
      if (businessData.expectedEmployees > tierLimits.employees && tierLimits.employees !== -1) {
        eligible = false;
        reasons.push(`Employee count (${businessData.expectedEmployees}) exceeds tier limit (${tierLimits.employees})`);
      }
      
      if (businessData.expectedLocations > tierLimits.locations && tierLimits.locations !== -1) {
        eligible = false;
        reasons.push(`Location count (${businessData.expectedLocations}) exceeds tier limit (${tierLimits.locations})`);
      }
      
      if (businessData.expectedMonthlyTransactions > tierLimits.transactions && tierLimits.transactions !== -1) {
        eligible = false;
        reasons.push(`Transaction volume (${businessData.expectedMonthlyTransactions}) exceeds tier limit (${tierLimits.transactions})`);
      }

      // Add warnings for approaching limits
      if (businessData.expectedEmployees > tierLimits.employees * 0.8 && tierLimits.employees !== -1) {
        warnings.push('Employee count is approaching tier limit');
      }
    }

    // Additional business logic validations can be added here
    
    return { eligible, reasons, warnings };
  }

  /**
   * Update user permissions cache (for local state management)
   */
  private async updateUserPermissionsCache(userId: string, permissions: string[]): Promise<void> {
    // Update Apollo cache or local storage as needed
    try {
      // This would typically update the user's permissions in the Apollo cache
      // or trigger a refetch of user data
      await this.apolloClient.cache.modify({
        id: `User:${userId}`,
        fields: {
          permissions: () => permissions,
        },
      });
    } catch (error) {
      console.warn('Failed to update permissions cache:', error);
    }
  }

  /**
   * Get tier upgrade path
   */
  getTierUpgradePath(currentTier: BusinessTier): BusinessTier[] {
    const tierOrder = [
      BusinessTier.MICRO,
      BusinessTier.SMALL,
      BusinessTier.MEDIUM,
      BusinessTier.ENTERPRISE,
    ];

    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder.slice(currentIndex + 1);
  }

  /**
   * Get tier downgrade path
   */
  getTierDowngradePath(currentTier: BusinessTier): BusinessTier[] {
    const tierOrder = [
      BusinessTier.MICRO,
      BusinessTier.SMALL,
      BusinessTier.MEDIUM,
      BusinessTier.ENTERPRISE,
    ];

    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder.slice(0, currentIndex).reverse();
  }
}

// Export singleton instance
let tierAssignmentServiceInstance: TierAssignmentService | null = null;

export const getTierAssignmentService = (apolloClient: ApolloClient<any>): TierAssignmentService => {
  if (!tierAssignmentServiceInstance) {
    tierAssignmentServiceInstance = new TierAssignmentService(apolloClient);
  }
  return tierAssignmentServiceInstance;
};

export default TierAssignmentService;