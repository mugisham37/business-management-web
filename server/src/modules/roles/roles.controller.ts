import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from './dto';

/**
 * Roles Controller
 * 
 * Provides REST API endpoints for role management:
 * - Create custom roles
 * - Read role data
 * - Update role information
 * - Delete roles
 * - Assign permissions to roles
 * - Assign roles to users
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.6
 */
@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * 
   * POST /roles
   * 
   * Requirement 19.1: WHEN a user creates a custom role, THE Auth_System SHALL 
   * validate the user possesses all permissions being assigned to the role
   * 
   * @param user - Current authenticated user
   * @param dto - Role creation data
   * @returns Created role
   */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles:create:role')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: CreateRoleDto,
  ) {
    this.logger.log(`Create role request: ${dto.code} by user ${user.id}`);

    const role = await this.rolesService.create(
      user.organizationId,
      dto,
      user.id,
    );

    return {
      success: true,
      data: role,
    };
  }

  /**
   * Get role by ID
   * 
   * GET /roles/:id
   * 
   * Requirement 19.1: Role CRUD operations
   * 
   * @param user - Current authenticated user
   * @param id - Role ID
   * @returns Role data
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findById(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') id: string,
  ) {
    this.logger.log(`Get role request: ${id} by user ${user.id}`);

    const role = await this.rolesService.findById(id, user.organizationId);

    if (!role) {
      return {
        success: false,
        message: 'Role not found',
      };
    }

    return {
      success: true,
      data: role,
    };
  }

  /**
   * Update a role
   * 
   * PATCH /roles/:id
   * 
   * Requirement 19.6: WHEN a system role is accessed, THE Auth_System SHALL 
   * prevent modification or deletion
   * 
   * @param user - Current authenticated user
   * @param id - Role ID
   * @param dto - Update data
   * @returns Updated role
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles:update:role')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    this.logger.log(`Update role request: ${id} by user ${user.id}`);

    const role = await this.rolesService.update(
      id,
      user.organizationId,
      dto,
      user.id,
    );

    return {
      success: true,
      data: role,
    };
  }

  /**
   * Delete a role
   * 
   * DELETE /roles/:id
   * 
   * Requirement 19.4: WHEN a role is deleted, THE Auth_System SHALL prevent 
   * deletion if users are assigned to it
   * 
   * @param user - Current authenticated user
   * @param id - Role ID
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles:delete:role')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') id: string,
  ) {
    this.logger.log(`Delete role request: ${id} by user ${user.id}`);

    await this.rolesService.delete(id, user.organizationId, user.id);

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  /**
   * Assign permissions to a role
   * 
   * POST /roles/:id/permissions
   * 
   * Requirement 19.3: WHEN a role's permissions are modified, THE Cache_Layer 
   * SHALL invalidate cache entries for all users with that role
   * 
   * @param user - Current authenticated user
   * @param id - Role ID
   * @param dto - Permission codes to assign
   * @returns Success response
   */
  @Post(':id/permissions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles:update:role')
  @HttpCode(HttpStatus.OK)
  async assignPermissions(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    this.logger.log(
      `Assign permissions to role request: ${id} by user ${user.id}`,
    );

    await this.rolesService.assignPermissions(
      id,
      user.organizationId,
      dto.permissionCodes,
      user.id,
    );

    return {
      success: true,
      message: 'Permissions assigned successfully',
    };
  }

  /**
   * Assign role to a user
   * 
   * POST /roles/:id/assign
   * 
   * Requirement 19.2: WHEN a role is assigned to a user, THE Auth_System SHALL 
   * support location and department scoping
   * 
   * @param user - Current authenticated user
   * @param id - Role ID
   * @param dto - User ID and scope information
   * @returns Success response
   */
  @Post(':id/assign')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('roles:assign:role')
  @HttpCode(HttpStatus.OK)
  async assignToUser(
    @CurrentUser() user: CurrentUserInfo,
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
  ) {
    this.logger.log(
      `Assign role to user request: ${id} to user ${dto.userId} by user ${user.id}`,
    );

    await this.rolesService.assignToUser(
      dto.userId,
      id,
      user.organizationId,
      {
        type: dto.scopeType,
        locationId: dto.locationId,
        departmentId: dto.departmentId,
      },
      user.id,
    );

    return {
      success: true,
      message: 'Role assigned to user successfully',
    };
  }
}
