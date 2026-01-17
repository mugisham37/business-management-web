import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocationRepository } from '../repositories/location.repository';
import { LocationPermissionDto } from '../dto/location.dto';

export interface LocationPermission {
  id: string;
  tenantId: string;
  userId: string;
  locationId: string;
  role: 'manager' | 'employee' | 'viewer';
  permissions: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface LocationAccessCheck {
  hasAccess: boolean;
  role?: string;
  permissions: string[];
  reason?: string;
}

@Injectable()
export class LocationPermissionsService {
  private readonly logger = new Logger(LocationPermissionsService.name);

  // Default permissions by role
  private readonly rolePermissions = {
    manager: [
      'location:read',
      'location:write',
      'location:delete',
      'location:manage_staff',
      'location:view_reports',
      'location:manage_inventory',
      'location:manage_pricing',
      'location:manage_promotions',
      'location:manage_settings',
    ],
    employee: [
      'location:read',
      'location:view_reports',
      'location:manage_inventory',
    ],
    viewer: [
      'location:read',
    ],
  };

  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Grant location access to a user
   */
  async grantLocationAccess(
    tenantId: string,
    data: LocationPermissionDto,
    grantedBy: string,
  ): Promise<LocationPermission> {
    try {
      // Verify location exists
      const location = await this.locationRepository.findById(tenantId, data.locationId);
      if (!location) {
        throw new NotFoundException('Location not found');
      }

      // Check if permission already exists
      const existingPermission = await this.getUserLocationPermission(tenantId, data.userId, data.locationId);
      if (existingPermission) {
        throw new ConflictException('User already has access to this location');
      }

      // Create permission record
      const permission: LocationPermission = {
        id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        userId: data.userId,
        locationId: data.locationId,
        role: data.role as 'manager' | 'employee' | 'viewer',
        permissions: data.permissions.length > 0 ? data.permissions : this.rolePermissions[data.role as keyof typeof this.rolePermissions],
        grantedBy,
        grantedAt: new Date(),
        isActive: true,
      };

      // In a real implementation, this would be stored in the database
      // For now, we'll emit an event for tracking
      this.eventEmitter.emit('location.permission.granted', {
        tenantId,
        permission,
        grantedBy,
      });

      this.logger.log(`Location access granted: ${data.userId} to ${data.locationId} as ${data.role}`);
      return permission;
    } catch (error: any) {
      this.logger.error(`Failed to grant location access: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revoke location access from a user
   */
  async revokeLocationAccess(
    tenantId: string,
    userId: string,
    locationId: string,
    revokedBy: string,
  ): Promise<void> {
    try {
      const permission = await this.getUserLocationPermission(tenantId, userId, locationId);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      // Mark permission as inactive
      permission.isActive = false;

      this.eventEmitter.emit('location.permission.revoked', {
        tenantId,
        permission,
        revokedBy,
      });

      this.logger.log(`Location access revoked: ${userId} from ${locationId}`);
    } catch (error: any) {
      this.logger.error(`Failed to revoke location access: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update user's location permissions
   */
  async updateLocationPermissions(
    tenantId: string,
    userId: string,
    locationId: string,
    updates: Partial<Pick<LocationPermission, 'role' | 'permissions'>>,
    updatedBy: string,
  ): Promise<LocationPermission> {
    try {
      const permission = await this.getUserLocationPermission(tenantId, userId, locationId);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      // Update permission
      if (updates.role) {
        permission.role = updates.role;
        // Update permissions based on new role if not explicitly provided
        if (!updates.permissions) {
          permission.permissions = this.rolePermissions[updates.role];
        }
      }

      if (updates.permissions) {
        permission.permissions = updates.permissions;
      }

      this.eventEmitter.emit('location.permission.updated', {
        tenantId,
        permission,
        updatedBy,
      });

      this.logger.log(`Location permissions updated: ${userId} for ${locationId}`);
      return permission;
    } catch (error: any) {
      this.logger.error(`Failed to update location permissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if user has access to a location
   */
  async checkLocationAccess(
    tenantId: string,
    userId: string,
    locationId: string,
    requiredPermission?: string,
  ): Promise<LocationAccessCheck> {
    try {
      const permission = await this.getUserLocationPermission(tenantId, userId, locationId);
      
      if (!permission || !permission.isActive) {
        return {
          hasAccess: false,
          permissions: [],
          reason: 'No active permission found',
        };
      }

      // Check if permission has expired
      if (permission.expiresAt && permission.expiresAt < new Date()) {
        return {
          hasAccess: false,
          permissions: [],
          reason: 'Permission has expired',
        };
      }

      // Check specific permission if required
      if (requiredPermission && !permission.permissions.includes(requiredPermission)) {
        return {
          hasAccess: false,
          permissions: permission.permissions,
          reason: `Missing required permission: ${requiredPermission}`,
        };
      }

      return {
        hasAccess: true,
        role: permission.role,
        permissions: permission.permissions,
      };
    } catch (error: any) {
      this.logger.error(`Failed to check location access: ${error.message}`, error.stack);
      return {
        hasAccess: false,
        permissions: [],
        reason: 'Error checking permissions',
      };
    }
  }

  /**
   * Get all locations a user has access to
   */
  async getUserAccessibleLocations(
    tenantId: string,
    userId: string,
  ): Promise<Array<{
    locationId: string;
    locationName: string;
    role: string;
    permissions: string[];
  }>> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      const mockPermissions = [
        {
          locationId: 'loc-1',
          locationName: 'Main Store',
          role: 'manager',
          permissions: this.rolePermissions.manager,
        },
        {
          locationId: 'loc-2',
          locationName: 'Warehouse',
          role: 'employee',
          permissions: this.rolePermissions.employee,
        },
      ];

      return mockPermissions;
    } catch (error: any) {
      this.logger.error(`Failed to get user accessible locations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all users with access to a location
   */
  async getLocationUsers(
    tenantId: string,
    locationId: string,
  ): Promise<Array<{
    userId: string;
    userName: string;
    role: string;
    permissions: string[];
    grantedAt: Date;
    grantedBy: string;
  }>> {
    try {
      // Verify location exists
      const location = await this.locationRepository.findById(tenantId, locationId);
      if (!location) {
        throw new NotFoundException('Location not found');
      }

      // In a real implementation, this would query the database
      // For now, return mock data
      const mockUsers = [
        {
          userId: 'user-1',
          userName: 'John Manager',
          role: 'manager',
          permissions: this.rolePermissions.manager,
          grantedAt: new Date('2024-01-01'),
          grantedBy: 'admin',
        },
        {
          userId: 'user-2',
          userName: 'Jane Employee',
          role: 'employee',
          permissions: this.rolePermissions.employee,
          grantedAt: new Date('2024-01-15'),
          grantedBy: 'user-1',
        },
      ];

      return mockUsers;
    } catch (error: any) {
      this.logger.error(`Failed to get location users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Bulk grant permissions to multiple users
   */
  async bulkGrantPermissions(
    tenantId: string,
    locationId: string,
    userPermissions: Array<{ userId: string; role: string; permissions?: string[] }>,
    grantedBy: string,
  ): Promise<LocationPermission[]> {
    try {
      const results: LocationPermission[] = [];

      for (const userPerm of userPermissions) {
        try {
          const permission = await this.grantLocationAccess(
            tenantId,
            {
              userId: userPerm.userId,
              locationId,
              role: userPerm.role,
              permissions: userPerm.permissions || [],
            },
            grantedBy,
          );
          results.push(permission);
        } catch (error: any) {
          this.logger.warn(`Failed to grant permission to user ${userPerm.userId}: ${error.message}`);
        }
      }

      return results;
    } catch (error: any) {
      this.logger.error(`Failed to bulk grant permissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's permission for a specific location
   */
  private async getUserLocationPermission(
    tenantId: string,
    userId: string,
    locationId: string,
  ): Promise<LocationPermission | null> {
    // In a real implementation, this would query the database
    // For now, return mock data based on some logic
    
    // Mock: assume user-1 is manager of loc-1, user-2 is employee of loc-2
    if (userId === 'user-1' && locationId === 'loc-1') {
      return {
        id: 'perm-1',
        tenantId,
        userId,
        locationId,
        role: 'manager',
        permissions: this.rolePermissions.manager,
        grantedBy: 'admin',
        grantedAt: new Date('2024-01-01'),
        isActive: true,
      };
    }

    if (userId === 'user-2' && locationId === 'loc-2') {
      return {
        id: 'perm-2',
        tenantId,
        userId,
        locationId,
        role: 'employee',
        permissions: this.rolePermissions.employee,
        grantedBy: 'user-1',
        grantedAt: new Date('2024-01-15'),
        isActive: true,
      };
    }

    return null;
  }

  /**
   * Validate permission hierarchy (managers can grant employee/viewer, employees can grant viewer)
   */
  async validatePermissionHierarchy(
    tenantId: string,
    granterId: string,
    locationId: string,
    targetRole: string,
  ): Promise<boolean> {
    try {
      const granterPermission = await this.getUserLocationPermission(tenantId, granterId, locationId);
      
      if (!granterPermission || !granterPermission.isActive) {
        return false;
      }

      // Managers can grant any role
      if (granterPermission.role === 'manager') {
        return true;
      }

      // Employees can only grant viewer role
      if (granterPermission.role === 'employee' && targetRole === 'viewer') {
        return true;
      }

      return false;
    } catch (error: any) {
      this.logger.error(`Failed to validate permission hierarchy: ${error.message}`, error.stack);
      return false;
    }
  }
}