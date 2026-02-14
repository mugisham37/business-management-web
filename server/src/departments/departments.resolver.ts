import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

/**
 * DepartmentsResolver
 * Implements requirements 16.3, 16.4
 * 
 * GraphQL resolver for department management operations.
 * All operations require authentication and appropriate permissions.
 */
@Resolver('Department')
export class DepartmentsResolver {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all departments in the organization
   * Requires 'departments.view' permission
   * @returns Array of departments
   */
  @Query('departments')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('departments.view')
  async departments() {
    return this.departmentsService.getDepartments();
  }

  /**
   * Create a new department
   * Requires 'departments.create' permission
   * @param input - Department creation data
   * @returns Created department
   */
  @Mutation('createDepartment')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('departments.create')
  async createDepartment(@Args('input') input: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(input);
  }

  /**
   * Update an existing department
   * Requires 'departments.edit' permission
   * @param id - Department ID
   * @param input - Department update data
   * @returns Updated department
   */
  @Mutation('updateDepartment')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('departments.edit')
  async updateDepartment(
    @Args('id') id: string,
    @Args('input') input: UpdateDepartmentDto,
  ) {
    return this.departmentsService.updateDepartment(id, input);
  }

  /**
   * Delete a department
   * Requires 'departments.delete' permission
   * @param id - Department ID
   * @returns Success boolean
   */
  @Mutation('deleteDepartment')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('departments.delete')
  async deleteDepartment(@Args('id') id: string) {
    await this.departmentsService.deleteDepartment(id);
    return true;
  }

  /**
   * Assign departments to a user
   * Requires 'users.edit' permission
   * @param userId - ID of user to assign departments to
   * @param departmentIds - Array of department IDs to assign
   * @returns Success boolean
   */
  @Mutation('assignDepartments')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('users.edit')
  async assignDepartments(
    @Args('userId') userId: string,
    @Args('departmentIds') departmentIds: string[],
  ) {
    await this.usersService.assignDepartments(userId, departmentIds);
    return true;
  }
}
