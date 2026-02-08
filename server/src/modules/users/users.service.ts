import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { LocationsService } from '../locations/locations.service';
import { AuditService } from '../../common/audit/audit.service';
import { User, Invitation } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  status?: 'active' | 'suspended' | 'deactivated' | 'locked';
  emailVerified?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
}

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    roleId: string;
    scope: {
      type: 'global' | 'location' | 'department';
      locationId?: string;
      departmentId?: string;
    };
  }>;
  permissions?: Array<{
    permissionCode: string;
    effect: 'allow' | 'deny';
    scope: {
      type: 'global' | 'location' | 'department';
      locationId?: string;
      departmentId?: string;
    };
  }>;
  locationIds: string[];
  departmentId?: string;
}

export interface AcceptInvitationDto {
  password: string;
  username?: string;
}

/**
 * Users Service for user management
 * 
 * Features:
 * - User CRUD operations with organization context
 * - User status management (suspend, reactivate, deactivate, lock, unlock)
 * - Department assignment
 * - Multi-tenant isolation
 * 
 * Requirements: 1.1, 6.1, 16.1, 16.2, 21.1, 21.2, 21.4, 21.5, 12.3, 20.2
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    private readonly permissions: PermissionsService,
    private readonly roles: RolesService,
    private readonly locations: LocationsService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Create a new user
   * 
   * Requirements:
   * - 1.1: Create user account with hashed password
   * - 6.1: Support username for team members
   * - 16.1: Include organization context in all operations
   * 
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - User creation data
   * @param creatorId - ID of user creating this user (optional for primary owner)
   * @returns Created user
   */
  async create(
    organizationId: string,
    dto: CreateUserDto,
    creatorId?: string,
  ): Promise<User> {
    try {
      // Check email uniqueness within organization
      const existingEmail = await this.findByEmail(dto.email, organizationId);
      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' already exists in this organization`);
      }

      // Check username uniqueness within organization (if provided)
      if (dto.username) {
        const existingUsername = await this.findByUsername(dto.username, organizationId);
        if (existingUsername) {
          throw new ConflictException(`Username '${dto.username}' already exists in this organization`);
        }
      }

      // Validate password strength
      const passwordValidation = this.security.validatePasswordStrength(dto.password);
      if (!passwordValidation.isValid) {
        throw new ForbiddenException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash password
      const passwordHash = await this.security.hashPassword(dto.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          organizationId,
          email: dto.email,
          username: dto.username,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          avatar: dto.avatar,
          departmentId: dto.departmentId,
          status: dto.status || 'active',
          emailVerified: dto.emailVerified || false,
          createdById: creatorId,
        },
      });

      this.logger.log(`User created: ${user.id} (${user.email}) in organization ${organizationId}`);

      return user;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID with organization context
   * 
   * Requirement 16.2: WHEN a user attempts to access resources, 
   * THE Auth_System SHALL verify the resource belongs to their organization
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns User or null
   */
  async findById(id: string, organizationId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find user by email with organization context
   * 
   * Requirement 16.1: WHEN any database query is executed, 
   * THE Auth_System SHALL include organization ID in the query filter
   * 
   * @param email - User email
   * @param organizationId - Organization ID for tenant isolation
   * @returns User or null
   */
  async findByEmail(email: string, organizationId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          email,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Find user by email globally (across all organizations)
   * 
   * Used for operations that need to find users without organization context,
   * such as email verification resend.
   * 
   * @param email - User email
   * @returns User or null
   */
  async findByEmailGlobal(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email globally: ${email}`, error);
      throw error;
    }
  }

  /**
   * Find user by username with organization context
   * 
   * Requirement 6.1: Team members authenticate with company code and username
   * 
   * @param username - Username
   * @param organizationId - Organization ID for tenant isolation
   * @returns User or null
   */
  async findByUsername(username: string, organizationId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          username,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by username: ${username}`, error);
      throw error;
    }
  }

  /**
   * Update user
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Update data
   * @param actorId - ID of user performing the update
   * @returns Updated user
   */
  async update(
    id: string,
    organizationId: string,
    dto: UpdateUserDto,
    actorId: string,
  ): Promise<User> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      // Check email uniqueness if being changed
      if (dto.email && dto.email !== existing.email) {
        const emailExists = await this.findByEmail(dto.email, organizationId);
        if (emailExists) {
          throw new ConflictException(`Email '${dto.email}' already exists in this organization`);
        }
      }

      // Check username uniqueness if being changed
      if (dto.username && dto.username !== existing.username) {
        const usernameExists = await this.findByUsername(dto.username, organizationId);
        if (usernameExists) {
          throw new ConflictException(`Username '${dto.username}' already exists in this organization`);
        }
      }

      // Capture before state for audit
      const beforeState = {
        email: existing.email,
        username: existing.username,
        firstName: existing.firstName,
        lastName: existing.lastName,
        phone: existing.phone,
        avatar: existing.avatar,
        departmentId: existing.departmentId,
      };

      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
      });

      // Capture after state for audit
      const afterState = {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        departmentId: user.departmentId,
      };

      // Audit log user update
      await this.audit.log({
        organizationId,
        userId: actorId,
        action: 'user_updated',
        resource: 'user',
        resourceId: id,
        outcome: 'success',
        beforeState,
        afterState,
        metadata: {
          targetUserId: id,
          targetUserEmail: user.email,
          changedFields: Object.keys(dto),
        },
      });

      this.logger.log(`User updated: ${id} by actor ${actorId}`);

      return user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the deletion
   */
  async delete(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      // Capture user state before deletion for audit
      const beforeState = {
        email: existing.email,
        username: existing.username,
        firstName: existing.firstName,
        lastName: existing.lastName,
        status: existing.status,
        departmentId: existing.departmentId,
      };

      // Delete user (cascade will handle related records)
      await this.prisma.user.delete({
        where: { id },
      });

      // Audit log user deletion
      await this.audit.log({
        organizationId,
        userId: actorId,
        action: 'user_deleted',
        resource: 'user',
        resourceId: id,
        outcome: 'success',
        beforeState,
        metadata: {
          targetUserId: id,
          targetUserEmail: existing.email,
        },
      });

      this.logger.log(`User deleted: ${id} by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Suspend user account
   * 
   * Requirement 21.1: WHEN a user is suspended, THE Auth_System SHALL prevent 
   * authentication but preserve account data
   * 
   * Requirement 21.4: WHEN a user status changes to suspended or deactivated, 
   * THE Session_Manager SHALL invalidate all active sessions
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the suspension
   * @param reason - Reason for suspension
   */
  async suspend(
    id: string,
    organizationId: string,
    actorId: string,
    reason?: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      const beforeState = {
        status: existing.status,
      };

      // Update user status
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'suspended',
        },
      });

      const afterState = {
        status: 'suspended',
      };

      // Invalidate all active sessions
      await this.invalidateAllSessions(id);

      // Audit log user suspension
      await this.audit.log({
        organizationId,
        userId: actorId,
        action: 'user_suspended',
        resource: 'user',
        resourceId: id,
        outcome: 'success',
        beforeState,
        afterState,
        metadata: {
          targetUserId: id,
          targetUserEmail: existing.email,
          reason: reason || 'No reason provided',
          sessionsInvalidated: true,
        },
      });

      this.logger.log(`User suspended: ${id} by actor ${actorId}${reason ? ` - Reason: ${reason}` : ''}`);
    } catch (error) {
      this.logger.error(`Failed to suspend user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Reactivate user account
   * 
   * Requirement 21.5: WHEN a suspended user is reactivated, 
   * THE Auth_System SHALL restore full access
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the reactivation
   */
  async reactivate(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      const beforeState = {
        status: existing.status,
      };

      // Update user status to active
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'active',
        },
      });

      const afterState = {
        status: 'active',
      };

      // Audit log user reactivation
      await this.audit.log({
        organizationId,
        userId: actorId,
        action: 'user_reactivated',
        resource: 'user',
        resourceId: id,
        outcome: 'success',
        beforeState,
        afterState,
        metadata: {
          targetUserId: id,
          targetUserEmail: existing.email,
        },
      });

      this.logger.log(`User reactivated: ${id} by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to reactivate user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   * 
   * Requirement 21.2: WHEN a user is deactivated, THE Auth_System SHALL prevent 
   * authentication and mark for potential deletion
   * 
   * Requirement 21.4: WHEN a user status changes to suspended or deactivated, 
   * THE Session_Manager SHALL invalidate all active sessions
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the deactivation
   */
  async deactivate(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      const beforeState = {
        status: existing.status,
      };

      // Update user status
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'deactivated',
        },
      });

      const afterState = {
        status: 'deactivated',
      };

      // Invalidate all active sessions
      await this.invalidateAllSessions(id);

      // Audit log user deactivation
      await this.audit.log({
        organizationId,
        userId: actorId,
        action: 'user_deactivated',
        resource: 'user',
        resourceId: id,
        outcome: 'success',
        beforeState,
        afterState,
        metadata: {
          targetUserId: id,
          targetUserEmail: existing.email,
          sessionsInvalidated: true,
        },
      });

      this.logger.log(`User deactivated: ${id} by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to deactivate user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Lock user account temporarily
   * 
   * Requirement 12.3: WHEN authentication attempts fail 10 times for a user, 
   * THE Auth_System SHALL lock the account for 30 minutes
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param reason - Reason for lock
   * @param durationMinutes - Lock duration in minutes (default: 30)
   */
  async lock(
    id: string,
    organizationId: string,
    reason: string,
    durationMinutes: number = 30,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + durationMinutes);

      // Update user status and set lock expiration
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'locked',
          lockedUntil,
        },
      });

      this.logger.log(`User locked: ${id} until ${lockedUntil.toISOString()} - Reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to lock user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Unlock user account
   * 
   * Requirement 21.3: WHEN a user is locked due to failed attempts, 
   * THE Auth_System SHALL automatically unlock after 30 minutes
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   */
  async unlock(
    id: string,
    organizationId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      // Update user status and clear lock
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'active',
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });

      this.logger.log(`User unlocked: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to unlock user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Assign user to a department
   * 
   * Requirement 20.2: WHEN a user is assigned to a department, 
   * THE Auth_System SHALL record the assignment
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param departmentId - Department ID
   * @param actorId - ID of user performing the assignment
   */
  async assignDepartment(
    id: string,
    organizationId: string,
    departmentId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      // Verify department exists and belongs to organization
      const department = await this.prisma.department.findFirst({
        where: {
          id: departmentId,
          organizationId,
        },
      });

      if (!department) {
        throw new NotFoundException(`Department not found: ${departmentId}`);
      }

      // Assign department
      await this.prisma.user.update({
        where: { id },
        data: {
          departmentId,
        },
      });

      this.logger.log(`User ${id} assigned to department ${departmentId} by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to assign department to user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Remove user from department
   * 
   * @param id - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param actorId - ID of user performing the removal
   */
  async removeDepartment(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`User not found: ${id}`);
      }

      // Remove department assignment
      await this.prisma.user.update({
        where: { id },
        data: {
          departmentId: null,
        },
      });

      this.logger.log(`User ${id} removed from department by actor ${actorId}`);
    } catch (error) {
      this.logger.error(`Failed to remove department from user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Invalidate all active sessions for a user
   * 
   * This is called when user status changes to suspended or deactivated
   * 
   * @param userId - User ID
   */
  private async invalidateAllSessions(userId: string): Promise<void> {
    try {
      await this.prisma.session.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'User status changed',
        },
      });

      this.logger.debug(`Invalidated all sessions for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate sessions for user: ${userId}`, error);
      // Don't throw - this is a secondary operation
    }
  }

  /**
   * Create an invitation for a new team member
   * 
   * Requirements:
   * - 4.1: Validate creator possesses all permissions being delegated
   * - 4.2: Generate unique invitation token valid for 7 days
   * - 4.3: Send invitation email with company code
   * - 4.4: Reject if creator attempts to delegate permissions they don't possess
   * - 4.6: Validate creator has access to specified locations
   * - 4.7: Validate role permissions are subset of creator permissions
   * 
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Invitation data
   * @param creatorId - ID of user creating the invitation
   * @returns Created invitation
   */
  async createInvitation(
    organizationId: string,
    dto: InviteUserDto,
    creatorId: string,
  ): Promise<Invitation> {
    try {
      // Get creator to verify organization
      const creator = await this.findById(creatorId, organizationId);
      if (!creator) {
        throw new NotFoundException(`Creator not found: ${creatorId}`);
      }

      // Get organization to include company code in invitation
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundException(`Organization not found: ${organizationId}`);
      }

      // Check if email already exists in organization
      const existingUser = await this.findByEmail(dto.email, organizationId);
      if (existingUser) {
        throw new ConflictException(`User with email '${dto.email}' already exists in this organization`);
      }

      // Check if there's already a pending invitation for this email
      const existingInvitation = await this.prisma.invitation.findFirst({
        where: {
          organizationId,
          email: dto.email,
          status: 'pending',
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingInvitation) {
        throw new ConflictException(`Pending invitation already exists for email '${dto.email}'`);
      }

      // Validate location access - creator must have access to all specified locations
      // Requirement 4.6: Location-scoped delegation validation
      for (const locationId of dto.locationIds) {
        const location = await this.locations.findById(locationId, organizationId);
        if (!location) {
          throw new NotFoundException(`Location not found: ${locationId}`);
        }

        // Check if creator has access to this location
        const creatorHasLocation = await this.prisma.userLocation.findFirst({
          where: {
            userId: creatorId,
            locationId,
          },
        });

        if (!creatorHasLocation) {
          throw new ForbiddenException(
            `Cannot invite user to location '${location.name}' - you do not have access to this location`,
          );
        }
      }

      // Validate department if specified
      if (dto.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: {
            id: dto.departmentId,
            organizationId,
          },
        });

        if (!department) {
          throw new NotFoundException(`Department not found: ${dto.departmentId}`);
        }
      }

      // Collect all permissions being delegated
      const allPermissionCodes: string[] = [];

      // Validate role permissions - creator must have all permissions from assigned roles
      // Requirement 4.7: Role-based delegation validation
      for (const roleAssignment of dto.roles) {
        const role = await this.roles.findById(roleAssignment.roleId, organizationId);
        if (!role) {
          throw new NotFoundException(`Role not found: ${roleAssignment.roleId}`);
        }

        // Get all permissions from this role
        const rolePermissions = await this.roles.getRolePermissions(roleAssignment.roleId);
        allPermissionCodes.push(...rolePermissions);

        // Validate location scope if specified
        if (roleAssignment.scope.type === 'location' && roleAssignment.scope.locationId) {
          const location = await this.locations.findById(
            roleAssignment.scope.locationId,
            organizationId,
          );
          if (!location) {
            throw new NotFoundException(`Location not found: ${roleAssignment.scope.locationId}`);
          }

          // Verify creator has access to this location
          const creatorHasLocation = await this.prisma.userLocation.findFirst({
            where: {
              userId: creatorId,
              locationId: roleAssignment.scope.locationId,
            },
          });

          if (!creatorHasLocation) {
            throw new ForbiddenException(
              `Cannot assign role with location scope '${location.name}' - you do not have access to this location`,
            );
          }
        }

        // Validate department scope if specified
        if (roleAssignment.scope.type === 'department' && roleAssignment.scope.departmentId) {
          const department = await this.prisma.department.findFirst({
            where: {
              id: roleAssignment.scope.departmentId,
              organizationId,
            },
          });

          if (!department) {
            throw new NotFoundException(`Department not found: ${roleAssignment.scope.departmentId}`);
          }
        }
      }

      // Add direct permissions if specified
      if (dto.permissions) {
        for (const perm of dto.permissions) {
          allPermissionCodes.push(perm.permissionCode);
        }
      }

      // Validate delegation - creator must have all permissions being delegated
      // Requirements 4.1, 4.4: Delegation validation
      if (allPermissionCodes.length > 0) {
        const canDelegate = await this.permissions.validateDelegation(
          creatorId,
          allPermissionCodes,
        );

        if (!canDelegate) {
          throw new ForbiddenException(
            'Cannot invite user with permissions you do not possess',
          );
        }
      }

      // Generate invitation token (7-day expiry)
      // Requirement 4.2: Generate unique invitation token valid for 7 days
      const token = this.security.generateToken(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      // Create invitation record with delegation data
      const invitation = await this.prisma.invitation.create({
        data: {
          organizationId,
          email: dto.email,
          token,
          roles: dto.roles,
          permissions: dto.permissions || [],
          locations: dto.locationIds,
          departmentId: dto.departmentId,
          createdById: creatorId,
          status: 'pending',
          expiresAt,
        },
      });

      // TODO: Send invitation email with company code
      // Requirement 4.3: Send invitation email with registration link and company code
      // This would integrate with an email service
      this.logger.log(
        `Invitation created: ${invitation.id} for ${dto.email} by creator ${creatorId}`,
      );
      this.logger.log(
        `Invitation link: /auth/register/invitation?token=${token}&companyCode=${organization.companyCode}`,
      );

      return invitation;
    } catch (error) {
      this.logger.error('Failed to create invitation:', error);
      throw error;
    }
  }

  /**
   * Validate an invitation token
   * 
   * Requirements:
   * - 5.1: Check token validity (not expired, not used)
   * 
   * @param token - Invitation token
   * @returns Invitation with delegation data
   */
  async validateInvitation(token: string): Promise<Invitation> {
    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
        include: {
          organization: true,
          createdBy: true,
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      // Check if invitation has expired
      if (invitation.expiresAt < new Date()) {
        throw new ForbiddenException('Invitation has expired');
      }

      // Check if invitation has already been accepted
      if (invitation.status === 'accepted') {
        throw new ForbiddenException('Invitation has already been used');
      }

      // Check if invitation has been revoked
      if (invitation.status === 'revoked') {
        throw new ForbiddenException('Invitation has been revoked');
      }

      return invitation;
    } catch (error) {
      this.logger.error('Failed to validate invitation:', error);
      throw error;
    }
  }

  /**
   * Accept an invitation and create team member account
   * 
   * Requirements:
   * - 5.1: Validate invitation token
   * - 5.2: Create hierarchy record linking to creator
   * - 5.3: Assign roles with scope
   * - 5.5: Mark email as verified automatically
   * - 5.6: Skip onboarding flow
   * 
   * @param token - Invitation token
   * @param dto - Team member registration data
   * @returns Created user
   */
  async acceptInvitation(
    token: string,
    dto: AcceptInvitationDto,
  ): Promise<User> {
    try {
      // Validate invitation token
      // Requirement 5.1: Validate invitation token
      const invitation = await this.validateInvitation(token);

      // Validate password strength
      const passwordValidation = this.security.validatePasswordStrength(dto.password);
      if (!passwordValidation.isValid) {
        throw new ForbiddenException(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        );
      }

      // Hash password
      const passwordHash = await this.security.hashPassword(dto.password);

      // Create user with delegated permissions in a transaction
      const user = await this.prisma.$transaction(async (tx) => {
        // Create user
        // Requirement 5.5: Mark email as verified automatically
        // Requirement 5.6: Skip onboarding flow (team members don't go through onboarding)
        const newUser = await tx.user.create({
          data: {
            organizationId: invitation.organizationId,
            email: invitation.email,
            username: dto.username,
            passwordHash,
            firstName: (invitation as any).firstName || 'Team',
            lastName: (invitation as any).lastName || 'Member',
            status: 'active',
            emailVerified: true, // Team members start verified
            createdById: invitation.createdById,
          },
        });

        // Create hierarchy record linking to creator
        // Requirement 5.2: Create hierarchy record linking to creator
        await tx.userHierarchy.create({
          data: {
            userId: newUser.id,
            parentId: invitation.createdById,
            depth: 0, // Direct report
          },
        });

        // Assign roles with scope
        // Requirement 5.3: Assign roles with scope
        const roles = invitation.roles as any[];
        for (const roleAssignment of roles) {
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId: roleAssignment.roleId,
              scopeType: roleAssignment.scope.type,
              locationId: roleAssignment.scope.locationId,
              departmentId: roleAssignment.scope.departmentId,
              assignedById: invitation.createdById,
            },
          });
        }

        // Assign direct permissions if specified
        const permissions = invitation.permissions as any[];
        if (permissions && permissions.length > 0) {
          for (const perm of permissions) {
            // Get permission by code
            const permission = await tx.permission.findUnique({
              where: { code: perm.permissionCode },
            });

            if (permission) {
              await tx.userPermission.create({
                data: {
                  userId: newUser.id,
                  permissionId: permission.id,
                  effect: perm.effect,
                  scopeType: perm.scope.type,
                  locationId: perm.scope.locationId,
                  departmentId: perm.scope.departmentId,
                  grantedById: invitation.createdById,
                },
              });
            }
          }
        }

        // Assign locations
        const locationIds = invitation.locations as string[];
        for (const locationId of locationIds) {
          await tx.userLocation.create({
            data: {
              userId: newUser.id,
              locationId,
              assignedById: invitation.createdById,
              isPrimary: locationIds.indexOf(locationId) === 0, // First location is primary
            },
          });
        }

        // Assign department if specified
        if (invitation.departmentId) {
          await tx.user.update({
            where: { id: newUser.id },
            data: {
              departmentId: invitation.departmentId,
            },
          });
        }

        // Mark invitation as accepted
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: 'accepted',
            acceptedById: newUser.id,
            acceptedAt: new Date(),
          },
        });

        return newUser;
      });

      this.logger.log(
        `Team member registered via invitation: ${user.id} (${user.email}) in organization ${invitation.organizationId}`,
      );

      return user;
    } catch (error) {
      this.logger.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Get user hierarchy chain to Primary_Owner
   * 
   * Requirement 24.2: WHEN querying user hierarchy, THE Auth_System SHALL 
   * return the complete chain to the Primary_Owner
   * 
   * This method traverses the hierarchy chain from the given user up to the 
   * Primary_Owner (the user with no parent), returning all parent relationships.
   * 
   * @param userId - User ID to get hierarchy for
   * @param organizationId - Organization ID for tenant isolation
   * @returns Array of UserHierarchy records representing the complete parent chain
   */
  async getHierarchy(userId: string, organizationId: string): Promise<any[]> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.findById(userId, organizationId);
      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Get all hierarchy records for this user
      const hierarchyChain: any[] = [];
      let currentUserId = userId;
      const visited = new Set<string>(); // Prevent infinite loops

      // Traverse up the hierarchy chain
      while (currentUserId && !visited.has(currentUserId)) {
        visited.add(currentUserId);

        // Find parent relationship
        const hierarchyRecord = await this.prisma.userHierarchy.findFirst({
          where: {
            userId: currentUserId,
          },
          include: {
            parent: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                organizationId: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                organizationId: true,
              },
            },
          },
        });

        if (!hierarchyRecord) {
          // No parent found - this is the Primary_Owner
          break;
        }

        // Verify parent belongs to same organization (security check)
        if (hierarchyRecord.parent.organizationId !== organizationId) {
          this.logger.error(
            `Hierarchy integrity violation: User ${currentUserId} has parent in different organization`,
          );
          break;
        }

        hierarchyChain.push(hierarchyRecord);

        // Move to parent
        currentUserId = hierarchyRecord.parentId;
      }

      this.logger.debug(`Retrieved hierarchy chain for user ${userId}: ${hierarchyChain.length} levels`);

      return hierarchyChain;
    } catch (error) {
      this.logger.error(`Failed to get hierarchy for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get all users created by a specific creator
   * 
   * Requirement 24.4: WHEN displaying user lists, THE Auth_System SHALL 
   * support filtering by creator
   * 
   * This method returns all users that were directly created by the specified creator.
   * 
   * @param creatorId - Creator user ID to filter by
   * @param organizationId - Organization ID for tenant isolation
   * @returns Array of users created by the specified creator
   */
  async getCreatedUsers(creatorId: string, organizationId: string): Promise<User[]> {
    try {
      // Verify creator exists and belongs to organization
      const creator = await this.findById(creatorId, organizationId);
      if (!creator) {
        throw new NotFoundException(`Creator not found: ${creatorId}`);
      }

      // Query users where createdBy = creatorId
      const createdUsers = await this.prisma.user.findMany({
        where: {
          createdById: creatorId,
          organizationId, // Ensure tenant isolation
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.debug(`Found ${createdUsers.length} users created by ${creatorId}`);

      return createdUsers;
    } catch (error) {
      this.logger.error(`Failed to get created users for creator: ${creatorId}`, error);
      throw error;
    }
  }
}
