import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '@prisma/client';
import { CreateRoleDto, UpdateRoleDto } from './dto';

export interface RoleScope {
  type: 'global' | 'location' | 'department';
  locationId?: string;
  departmentId?: string;
}

/**
 * Roles Service for role management
 * 
 * Features:
 * - Role CRUD operations with validation
 * - Role-permission assignments
 * - User-role assignments with scope
 * - System role protection
 * - Delegation validation
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.6, 7.3
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: PermissionsService,
  ) {}

  /**
   * Create a new role
   * 
   * Requirement 19.1: WHEN a user creates a custom role, THE Auth_System SHALL 
   * validate the user possesses all permissions being assigned to the role
   * 
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Role creation data
   * @param creatorId - ID of user creating the role
   * @returns Created role
   */
  async create(
    organizationId: string,
    dto: CreateRoleDto,
    creatorId: string,
  ): Promise<Role> {
    try {
      // Check code uniqueness within organization
      const existingCode = await this.prisma.role.findFirst({
        where: {
          code: dto.code,
          organizationId,
        },
      });

      if (existingCode) {
        throw new ConflictException(`Role code '${dto.code}' already exists in this organization`);
      }

      // Create role
      const role = await this.prisma.role.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          description: dto.description,
          isSystem: false,
          isActive: true,
        },
      });

      this.logger.log(`Role created: ${role.id} (${role.code}) by creator ${creatorId}`);

      return role;
    } catch (error) {
      this.logger.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Find role by ID with organization context
   * 
   * @param id - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Role or null
   */
  async findById(id: string, organizationId: string): Promise<Role | null> {
    try {
      return await this.prisma.role.findFirst({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find role by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all roles for an organization
   * 
   * @param organizationId - Organization ID
   * @returns Array of roles
   */
  async findByOrganization(organizationId: string): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        where: {
          organizationId,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find roles for organization: ${organizationId}`, error);
      throw error;
    }
  }

  /**
   * Update a role
   * 
   * Requirement 19.6: WHEN a system role is accessed, THE Auth_System SHALL 
   * prevent modification or deletion
   * 
   * @param id - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Update data
   * @param actorId - ID of user performing the update
   * @returns Updated role
   */
  async update(
    id: string,
    organizationId: string,
    dto: UpdateRoleDto,
    actorId: string,
  ): Promise<Role> {
    try {
      // Verify role exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Role not found: ${id}`);
      }

      // Prevent modification of system roles
      if (existing.isSystem) {
        throw new ForbiddenException('Cannot modify system roles');
      }

      const role = await this.prisma.role.update({
        where: { id },
        data: dto,
      });

      this.logger.log(`Role updated: ${id} by actor ${actorId}`);

      return role;
    } catch (error) {
      this.logger.error(`Failed to update role: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a role
   * 
   * Requirement 19.4: WHEN a role is deleted, THE Auth_System SHALL prevent 
   * deletion if users are assigned to it
   * 
   * Requirement 19.6: WHEN a system role is accessed, THE Auth_System SHALL 
   * prevent modification or deletion
   * 
   * @param id - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the deletion
   */
  async delete(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify role exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Role not found: ${id}`);
      }

      // Prevent deletion of system roles
      if (existing.isSystem) {
        throw new ForbiddenException('Cannot delete system roles');
      }

      // Check for user assignments
      const userCount = await this.prisma.userRole.count({
        where: { roleId: id },
      });

      if (userCount > 0) {
        throw new ForbiddenException(
          `Cannot delete role: ${userCount} user(s) are assigned to this role`,
        );
      }

      // Delete role (cascade will handle role permissions)
      await this.prisma.role.delete({
        where: { id },
      });

      this.logger.log(`Role deleted: ${id} by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to delete role: ${id}`, error);
      throw error;
    }
  }

  /**
   * Assign permissions to a role
   * 
   * Requirement 19.3: WHEN a role's permissions are modified, THE Cache_Layer 
   * SHALL invalidate cache entries for all users with that role
   * 
   * Requirement 19.1: Validate creator has all permissions being assigned
   * 
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param permissionCodes - Array of permission codes to assign
   * @param actorId - ID of user performing the assignment
   */
  async assignPermissions(
    roleId: string,
    organizationId: string,
    permissionCodes: string[],
    actorId: string,
  ): Promise<void> {
    try {
      // Verify role exists and belongs to organization
      const role = await this.findById(roleId, organizationId);
      if (!role) {
        throw new NotFoundException(`Role not found: ${roleId}`);
      }

      // Prevent modification of system roles
      if (role.isSystem) {
        throw new ForbiddenException('Cannot modify permissions of system roles');
      }

      // Validate that actor has all permissions being assigned (delegation validation)
      const canDelegate = await this.permissions.validateDelegation(
        actorId,
        permissionCodes,
      );

      if (!canDelegate) {
        throw new ForbiddenException(
          'Cannot assign permissions you do not possess',
        );
      }

      // Get permission IDs from codes
      const permissions = await this.prisma.permission.findMany({
        where: {
          code: {
            in: permissionCodes,
          },
        },
      });

      if (permissions.length !== permissionCodes.length) {
        const foundCodes = permissions.map(p => p.code);
        const missingCodes = permissionCodes.filter(c => !foundCodes.includes(c));
        throw new NotFoundException(`Permissions not found: ${missingCodes.join(', ')}`);
      }

      // Create role-permission assignments
      await this.prisma.$transaction(async (tx) => {
        for (const permission of permissions) {
          await tx.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId,
                permissionId: permission.id,
              },
            },
            create: {
              roleId,
              permissionId: permission.id,
              assignedById: actorId,
            },
            update: {
              assignedById: actorId,
              assignedAt: new Date(),
            },
          });
        }
      });

      // Invalidate cache for all users with this role
      await this.permissions.invalidateRoleCache(roleId);

      this.logger.log(
        `Permissions assigned to role ${roleId}: ${permissionCodes.join(', ')} by actor ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to assign permissions to role: ${roleId}`, error);
      throw error;
    }
  }

  /**
   * Remove a permission from a role
   * 
   * Requirement 19.3: WHEN a role's permissions are modified, THE Cache_Layer 
   * SHALL invalidate cache entries for all users with that role
   * 
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param permissionCode - Permission code to remove
   * @param actorId - ID of user performing the removal
   */
  async removePermission(
    roleId: string,
    organizationId: string,
    permissionCode: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify role exists and belongs to organization
      const role = await this.findById(roleId, organizationId);
      if (!role) {
        throw new NotFoundException(`Role not found: ${roleId}`);
      }

      // Prevent modification of system roles
      if (role.isSystem) {
        throw new ForbiddenException('Cannot modify permissions of system roles');
      }

      // Get permission by code
      const permission = await this.prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new NotFoundException(`Permission not found: ${permissionCode}`);
      }

      // Delete role-permission assignment
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: permission.id,
        },
      });

      // Invalidate cache for all users with this role
      await this.permissions.invalidateRoleCache(roleId);

      this.logger.log(
        `Permission removed from role ${roleId}: ${permissionCode} by actor ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to remove permission from role: ${roleId}`, error);
      throw error;
    }
  }

  /**
   * Assign a role to a user with scope
   * 
   * Requirement 19.2: WHEN a role is assigned to a user, THE Auth_System SHALL 
   * support location and department scoping
   * 
   * Requirement 4.7: Validate role permissions are subset of creator permissions
   * 
   * @param userId - User ID
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param scope - Role scope (global, location, or department)
   * @param actorId - ID of user performing the assignment
   */
  async assignToUser(
    userId: string,
    roleId: string,
    organizationId: string,
    scope: RoleScope,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify role exists and belongs to organization
      const role = await this.findById(roleId, organizationId);
      if (!role) {
        throw new NotFoundException(`Role not found: ${roleId}`);
      }

      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Get all permissions from the role
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
      });

      const permissionCodes = rolePermissions.map(rp => rp.permission.code);

      // Validate delegation: actor must have all permissions from the role
      if (permissionCodes.length > 0) {
        const canDelegate = await this.permissions.validateDelegation(
          actorId,
          permissionCodes,
        );

        if (!canDelegate) {
          throw new ForbiddenException(
            'Cannot assign role with permissions you do not possess',
          );
        }
      }

      // Validate location scope if specified
      if (scope.type === 'location' && scope.locationId) {
        const location = await this.prisma.location.findFirst({
          where: {
            id: scope.locationId,
            organizationId,
          },
        });

        if (!location) {
          throw new NotFoundException(`Location not found: ${scope.locationId}`);
        }

        // Verify actor has access to this location
        const actorHasLocation = await this.prisma.userLocation.findFirst({
          where: {
            userId: actorId,
            locationId: scope.locationId,
          },
        });

        if (!actorHasLocation) {
          throw new ForbiddenException(
            'Cannot assign role with location scope you do not have access to',
          );
        }
      }

      // Validate department scope if specified
      if (scope.type === 'department' && scope.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: {
            id: scope.departmentId,
            organizationId,
          },
        });

        if (!department) {
          throw new NotFoundException(`Department not found: ${scope.departmentId}`);
        }
      }

      // Create user-role assignment
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
          scopeType: scope.type,
          locationId: scope.locationId,
          departmentId: scope.departmentId,
          assignedById: actorId,
        },
      });

      // Invalidate user cache
      await this.permissions.invalidateUserCache(userId);

      this.logger.log(
        `Role ${roleId} assigned to user ${userId} with scope ${scope.type} by actor ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to assign role to user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Remove a role from a user
   * 
   * @param userId - User ID
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the removal
   */
  async removeFromUser(
    userId: string,
    roleId: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify role exists and belongs to organization
      const role = await this.findById(roleId, organizationId);
      if (!role) {
        throw new NotFoundException(`Role not found: ${roleId}`);
      }

      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Delete user-role assignments
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          roleId,
        },
      });

      // Invalidate user cache
      await this.permissions.invalidateUserCache(userId);

      this.logger.log(
        `Role ${roleId} removed from user ${userId} by actor ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to remove role from user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get all permissions for a role
   * 
   * Requirement 7.3: Permission evaluation with role-based permissions
   * 
   * @param roleId - Role ID
   * @returns Array of permission codes
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
      });

      return rolePermissions.map(rp => rp.permission.code);
    } catch (error) {
      this.logger.error(`Failed to get role permissions: ${roleId}`, error);
      throw error;
    }
  }

  /**
   * Get all roles for a user with context filtering
   * 
   * Requirement 7.3: Permission evaluation with role-based permissions
   * 
   * @param userId - User ID
   * @param context - Optional context for filtering (location, department)
   * @returns Array of roles
   */
  async getUserRoles(
    userId: string,
    context?: {
      locationId?: string;
      departmentId?: string;
    },
  ): Promise<Role[]> {
    try {
      const whereClause: any = {
        userId,
        role: {
          isActive: true,
        },
      };

      // Apply context filtering if provided
      if (context) {
        const orConditions: any[] = [
          // Global scope always applies
          { scopeType: 'global' },
        ];

        // Add location scope if context has location
        if (context.locationId) {
          orConditions.push({
            scopeType: 'location',
            locationId: context.locationId,
          });
        }

        // Add department scope if context has department
        if (context.departmentId) {
          orConditions.push({
            scopeType: 'department',
            departmentId: context.departmentId,
          });
        }

        whereClause.OR = orConditions;
      }

      const userRoles = await this.prisma.userRole.findMany({
        where: whereClause,
        include: {
          role: true,
        },
      });

      return userRoles.map(ur => ur.role);
    } catch (error) {
      this.logger.error(`Failed to get user roles: ${userId}`, error);
      throw error;
    }
  }
}
