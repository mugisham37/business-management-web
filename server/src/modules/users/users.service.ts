import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { User } from '@prisma/client';

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

      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
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

      // Delete user (cascade will handle related records)
      await this.prisma.user.delete({
        where: { id },
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

      // Update user status
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'suspended',
        },
      });

      // Invalidate all active sessions
      await this.invalidateAllSessions(id);

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

      // Update user status to active
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'active',
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

      // Update user status
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'deactivated',
        },
      });

      // Invalidate all active sessions
      await this.invalidateAllSessions(id);

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
}
