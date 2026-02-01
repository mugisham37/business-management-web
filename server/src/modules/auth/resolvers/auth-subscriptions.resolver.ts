import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permission.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { AuthEventType, AuthEvent } from '../types/auth-events.types';

// Re-export types for backward compatibility
export { AuthEventType, AuthEvent } from '../types/auth-events.types';

/**
 * Auth Subscriptions Resolver
 * Provides real-time updates for authentication and authorization events
 * All subscriptions require authentication and appropriate permissions
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AuthSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  /**
   * Subscribe to user authentication events
   * Receives login, logout, and session events for the current user
   */
  @Subscription(() => String, {
    description: 'Subscribe to authentication events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.userId === user.id && payload.tenantId === user.tenantId;
    },
  })
  async userAuthEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`auth.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to permission changes for current user
   * Receives permission grants, revokes, and role changes
   */
  @Subscription(() => String, {
    description: 'Subscribe to permission changes for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.userId === user.id && payload.tenantId === user.tenantId;
    },
  })
  async userPermissionEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`permissions.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to tenant-wide authentication events
   * Requires admin permissions to monitor tenant security events
   */
  @Subscription(() => String, {
    description: 'Subscribe to tenant-wide authentication events',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.tenantId === user.tenantId;
    },
  })
  @UseGuards(PermissionsGuard)
  @Permissions('security:monitor')
  async tenantAuthEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`auth.tenant.${user.tenantId}`, user.tenantId);
  }

  /**
   * Subscribe to security alerts
   * Receives failed login attempts, account lockouts, and suspicious activities
   */
  @Subscription(() => String, {
    description: 'Subscribe to security alerts for tenant',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.tenantId === user.tenantId && [
        AuthEventType.FAILED_LOGIN_ATTEMPT,
        AuthEventType.ACCOUNT_LOCKED,
        AuthEventType.ACCOUNT_UNLOCKED,
      ].includes(payload.type);
    },
  })
  @UseGuards(PermissionsGuard)
  @Permissions('security:alerts')
  async securityAlerts(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`security.tenant.${user.tenantId}`, user.tenantId);
  }

  /**
   * Subscribe to MFA events for current user
   * Receives MFA setup, enable, disable, and verification events
   */
  @Subscription(() => String, {
    description: 'Subscribe to MFA events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.userId === user.id && payload.tenantId === user.tenantId && [
        AuthEventType.MFA_ENABLED,
        AuthEventType.MFA_DISABLED,
      ].includes(payload.type);
    },
  })
  async userMfaEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`mfa.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to session events for current user
   * Receives session creation, expiration, and revocation events
   */
  @Subscription(() => String, {
    description: 'Subscribe to session events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.userId === user.id && payload.tenantId === user.tenantId;
    },
  })
  async userSessionEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`sessions.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to role changes in tenant
   * Requires admin permissions to monitor role assignments
   */
  @Subscription(() => String, {
    description: 'Subscribe to role assignment events in tenant',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.tenantId === user.tenantId && payload.type === AuthEventType.ROLE_ASSIGNED;
    },
  })
  @UseGuards(PermissionsGuard)
  @Permissions('roles:monitor')
  async tenantRoleEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`roles.tenant.${user.tenantId}`, user.tenantId);
  }

  /**
   * Subscribe to specific user events (for admin monitoring)
   * Requires admin permissions to monitor other users
   */
  @Subscription(() => String, {
    description: 'Subscribe to events for a specific user',
    filter: (payload: AuthEvent, variables: { userId: string }, context: any) => {
      const user = context.req.user as AuthenticatedUser;
      return payload.userId === variables.userId && payload.tenantId === user.tenantId;
    },
  })
  @UseGuards(PermissionsGuard)
  @Permissions('users:monitor')
  async userEvents(
    @Args('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`auth.user.${userId}`, user.tenantId);
  }
}