import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import {
  CreateManagerDto,
  CreateWorkerDto,
  UpdateUserDto,
} from './dto';

/**
 * UsersResolver
 * Implements requirements 16.3, 16.4
 * 
 * GraphQL resolver for user management operations.
 * All mutations require authentication via JwtAuthGuard.
 * Permission-based operations use PermissionGuard with @RequirePermission decorator.
 */
@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current authenticated user
   * @returns Current user object
   */
  @Query('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return this.usersService.getUserById(user.userId, user.organizationId);
  }

  /**
   * Get user by ID
   * Requires 'users.view' permission
   * @param id - User ID
   * @returns User object or null if not found
   */
  @Query('user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.view')
  async user(@Args('id') id: string, @CurrentUser() user: any) {
    try {
      return await this.usersService.getUserById(id, user.organizationId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get list of users with optional filters
   * Requires 'users.view' permission
   * @param filters - Optional filters (role, branchId, departmentId)
   * @returns Array of users
   */
  @Query('users')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.view')
  async users(
    @Args('filters') filters: any,
    @CurrentUser() user: any,
  ) {
    // For now, return all users in the organization
    // TODO: Implement filtering by role, branchId, departmentId
    const allUsers = await this.usersService.getUserById(user.userId, user.organizationId);
    // This is a simplified implementation - in production, you'd query all users with filters
    return [allUsers];
  }

  /**
   * Create a Manager user
   * Requires 'users.create' permission
   * @param input - Manager creation data
   * @returns Created user
   */
  @Mutation('createManager')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.create')
  async createManager(
    @Args('input') input: CreateManagerDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.createManager(user.userId, input);
  }

  /**
   * Create a Worker user
   * Requires 'users.create' permission
   * @param input - Worker creation data
   * @returns Created user
   */
  @Mutation('createWorker')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.create')
  async createWorker(
    @Args('input') input: CreateWorkerDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.createWorker(user.userId, input);
  }

  /**
   * Update user information
   * Requires 'users.edit' permission
   * @param id - User ID to update
   * @param input - Update data
   * @returns Updated user
   */
  @Mutation('updateUser')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.edit')
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, input);
  }

  /**
   * Delete a user
   * Requires 'users.delete' permission
   * @param id - User ID to delete
   * @returns Success boolean
   */
  @Mutation('deleteUser')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.delete')
  async deleteUser(@Args('id') id: string) {
    await this.usersService.deleteUser(id);
    return true;
  }

  /**
   * Transfer ownership to another user
   * Only current Owner can perform this operation
   * @param newOwnerId - ID of user to promote to Owner
   * @returns Success boolean
   */
  @Mutation('transferOwnership')
  @UseGuards(JwtAuthGuard)
  async transferOwnership(
    @Args('newOwnerId') newOwnerId: string,
    @CurrentUser() user: any,
  ) {
    await this.usersService.transferOwnership(user.userId, newOwnerId);
    return true;
  }
}
