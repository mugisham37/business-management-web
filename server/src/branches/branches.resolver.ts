import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateBranchDto, UpdateBranchDto } from './dto';

/**
 * BranchesResolver
 * Implements requirements 16.3, 16.4
 * 
 * GraphQL resolver for branch management operations.
 * All operations require authentication and appropriate permissions.
 */
@Resolver('Branch')
export class BranchesResolver {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all branches in the organization
   * Requires 'branches.view' permission
   * @returns Array of branches
   */
  @Query('branches')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('branches.view')
  async branches() {
    return this.branchesService.getBranches();
  }

  /**
   * Create a new branch
   * Requires 'branches.create' permission
   * @param input - Branch creation data
   * @returns Created branch
   */
  @Mutation('createBranch')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('branches.create')
  async createBranch(@Args('input') input: CreateBranchDto) {
    return this.branchesService.createBranch(input);
  }

  /**
   * Update an existing branch
   * Requires 'branches.edit' permission
   * @param id - Branch ID
   * @param input - Branch update data
   * @returns Updated branch
   */
  @Mutation('updateBranch')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('branches.edit')
  async updateBranch(
    @Args('id') id: string,
    @Args('input') input: UpdateBranchDto,
  ) {
    return this.branchesService.updateBranch(id, input);
  }

  /**
   * Delete a branch
   * Requires 'branches.delete' permission
   * @param id - Branch ID
   * @returns Success boolean
   */
  @Mutation('deleteBranch')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('branches.delete')
  async deleteBranch(@Args('id') id: string) {
    await this.branchesService.deleteBranch(id);
    return true;
  }

  /**
   * Assign branches to a user
   * Requires 'users.edit' permission
   * @param userId - ID of user to assign branches to
   * @param branchIds - Array of branch IDs to assign
   * @returns Success boolean
   */
  @Mutation('assignBranches')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.edit')
  async assignBranches(
    @Args('userId') userId: string,
    @Args('branchIds') branchIds: string[],
  ) {
    await this.usersService.assignBranches(userId, branchIds);
    return true;
  }
}
