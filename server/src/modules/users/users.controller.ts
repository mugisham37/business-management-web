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
import { UsersService, InviteUserDto, AcceptInvitationDto, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { Organization } from '../../common/decorators/organization.decorator';

/**
 * Users Controller
 * 
 * Provides REST API endpoints for user management operations:
 * - Invite team members
 * - Accept invitations
 * - User CRUD operations
 * - User status management (suspend, reactivate)
 * - User hierarchy queries
 * 
 * Requirements: 4.1, 5.1, 15.4, 16.2, 21.1, 21.5, 24.2, 24.4
 */
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Invite a new team member
   * 
   * POST /users/invite
   * 
   * Requirement 4.1: WHEN a Creator invites a Team_Member, THE Invitation_System 
   * SHALL validate the Creator possesses all permissions being delegated
   * 
   * @param dto - Invitation data (email, roles, permissions, locations)
   * @param user - Current authenticated user (creator)
   * @param organizationId - Organization ID from JWT
   * @returns Created invitation details
   */
  @Post('invite')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:create:invitation')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Body() dto: InviteUserDto,
    @CurrentUser() user: CurrentUserInfo,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Invitation request from user ${user.id} for email: ${dto.email}`);

    const invitation = await this.usersService.createInvitation(
      organizationId,
      dto,
      user.id,
    );

    return {
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    };
  }

  /**
   * Accept an invitation and register as team member
   * 
   * POST /users/register/invitation
   * 
   * Requirement 5.1: WHEN a Team_Member submits the invitation token with password, 
   * THE Auth_System SHALL create the user account with delegated permissions
   * 
   * @param body - Invitation token and registration data
   * @returns Created user data
   */
  @Post('register/invitation')
  @HttpCode(HttpStatus.CREATED)
  async acceptInvitation(
    @Body() body: { token: string; password: string; username?: string },
  ) {
    this.logger.log('Team member registration via invitation');

    const dto: AcceptInvitationDto = {
      password: body.password,
      username: body.username,
    };

    const user = await this.usersService.acceptInvitation(body.token, dto);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Get user by ID
   * 
   * GET /users/:id
   * 
   * Requirement 16.2: WHEN a user attempts to access resources, THE Auth_System 
   * SHALL verify the resource belongs to their organization
   * 
   * @param id - User ID
   * @param organizationId - Organization ID from JWT
   * @returns User data
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:read:user')
  async getUserById(
    @Param('id') id: string,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Get user request for ID: ${id}`);

    const user = await this.usersService.findById(id, organizationId);

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Remove sensitive fields
    const { passwordHash, mfaSecret, ...userData } = user;

    return {
      success: true,
      data: userData,
    };
  }

  /**
   * Update user
   * 
   * PATCH /users/:id
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param dto - Update data
   * @param user - Current authenticated user (actor)
   * @param organizationId - Organization ID from JWT
   * @returns Updated user data
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:update:user')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: CurrentUserInfo,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Update user request for ID: ${id} by actor ${user.id}`);

    const updatedUser = await this.usersService.update(
      id,
      organizationId,
      dto,
      user.id,
    );

    // Remove sensitive fields
    const { passwordHash, mfaSecret, ...userData } = updatedUser;

    return {
      success: true,
      data: userData,
    };
  }

  /**
   * Delete user
   * 
   * DELETE /users/:id
   * 
   * Requirement 15.4: WHEN a user is created, modified, or deleted, THE Audit_Logger 
   * SHALL record the event with actor information
   * 
   * @param id - User ID
   * @param user - Current authenticated user (actor)
   * @param organizationId - Organization ID from JWT
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:delete:user')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInfo,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Delete user request for ID: ${id} by actor ${user.id}`);

    await this.usersService.delete(id, organizationId, user.id);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  /**
   * Suspend user account
   * 
   * POST /users/:id/suspend
   * 
   * Requirement 21.1: WHEN a user is suspended, THE Auth_System SHALL prevent 
   * authentication but preserve account data
   * 
   * @param id - User ID
   * @param body - Suspension reason (optional)
   * @param user - Current authenticated user (actor)
   * @param organizationId - Organization ID from JWT
   * @returns Success response
   */
  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:suspend:user')
  @HttpCode(HttpStatus.OK)
  async suspendUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserInfo,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Suspend user request for ID: ${id} by actor ${user.id}`);

    await this.usersService.suspend(id, organizationId, user.id, body.reason);

    return {
      success: true,
      message: 'User suspended successfully',
    };
  }

  /**
   * Reactivate user account
   * 
   * POST /users/:id/reactivate
   * 
   * Requirement 21.5: WHEN a suspended user is reactivated, THE Auth_System 
   * SHALL restore full access
   * 
   * @param id - User ID
   * @param user - Current authenticated user (actor)
   * @param organizationId - Organization ID from JWT
   * @returns Success response
   */
  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users:reactivate:user')
  @HttpCode(HttpStatus.OK)
  async reactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInfo,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Reactivate user request for ID: ${id} by actor ${user.id}`);

    await this.usersService.reactivate(id, organizationId, user.id);

    return {
      success: true,
      message: 'User reactivated successfully',
    };
  }

  /**
   * Get user hierarchy chain
   * 
   * GET /users/:id/hierarchy
   * 
   * Requirement 24.2: WHEN querying user hierarchy, THE Auth_System SHALL 
   * return the complete chain to the Primary_Owner
   * 
   * @param id - User ID
   * @param organizationId - Organization ID from JWT
   * @returns Hierarchy chain to Primary_Owner
   */
  @Get(':id/hierarchy')
  @UseGuards(JwtAuthGuard)
  async getUserHierarchy(
    @Param('id') id: string,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Get hierarchy request for user ID: ${id}`);

    const hierarchy = await this.usersService.getHierarchy(id, organizationId);

    return {
      success: true,
      data: hierarchy,
    };
  }

  /**
   * Get users created by a specific creator
   * 
   * GET /users/:id/created-users
   * 
   * Requirement 24.4: WHEN displaying user lists, THE Auth_System SHALL 
   * support filtering by creator
   * 
   * @param id - Creator user ID
   * @param organizationId - Organization ID from JWT
   * @returns List of users created by the specified creator
   */
  @Get(':id/created-users')
  @UseGuards(JwtAuthGuard)
  async getCreatedUsers(
    @Param('id') id: string,
    @Organization() organizationId: string,
  ) {
    this.logger.log(`Get created users request for creator ID: ${id}`);

    const users = await this.usersService.getCreatedUsers(id, organizationId);

    // Remove sensitive fields from all users
    const sanitizedUsers = users.map(user => {
      const { passwordHash, mfaSecret, ...userData } = user;
      return userData;
    });

    return {
      success: true,
      data: sanitizedUsers,
    };
  }
}
