import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { AuthEventType, AuthEvent } from '../types/auth-events.types';

/**
 * Auth Subscriptions Resolver
 * 
 * Provides real-time GraphQL subscriptions for authentication and authorization events.
 * All subscriptions require authentication and appropriate permissions.
 * 
 * Features:
 * - User-specific auth events (login, logout, session changes)
 * - Permission and role change notifications
 * - Security alerts and monitoring
 * - MFA event notifications
 * - Tenant-wide security monitoring (admin only)
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AuthSubscriptionsResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly pubSubService: PubSubService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Subscribe to user authentication events
   * Receives login, logout, and session events for the current user
   */
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to authentication events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to permission changes for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.userId === user.id && payload.tenantId === user.tenantId && [
        AuthEventType.PERMISSION_GRANTED,
        AuthEventType.PERMISSION_REVOKED,
        AuthEventType.ROLE_ASSIGNED,
      ].includes(payload.type);
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to tenant-wide authentication events',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to security alerts for tenant',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.tenantId === user.tenantId && [
        AuthEventType.FAILED_LOGIN_ATTEMPT,
        AuthEventType.ACCOUNT_LOCKED,
        AuthEventType.ACCOUNT_UNLOCKED,
        AuthEventType.SECURITY_ALERT,
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to MFA events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to session events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.userId === user.id && payload.tenantId === user.tenantId && [
        AuthEventType.SESSION_EXPIRED,
      ].includes(payload.type);
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
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to role assignment events in tenant',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
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
   * Subscribe to social provider events for current user
   * Receives social provider linking and unlinking events
   */
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to social provider events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.userId === user.id && payload.tenantId === user.tenantId && [
        AuthEventType.SOCIAL_PROVIDER_LINKED,
        AuthEventType.SOCIAL_PROVIDER_UNLINKED,
      ].includes(payload.type);
    },
  })
  async userSocialProviderEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`social.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to risk assessment events for current user
   * Receives risk score changes and security recommendations
   */
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to risk assessment events for current user',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.userId === user.id && payload.tenantId === user.tenantId && 
        payload.type === AuthEventType.RISK_ASSESSMENT;
    },
  })
  async userRiskEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`risk.user.${user.id}`, user.tenantId);
  }

  /**
   * Subscribe to specific user events (for admin monitoring)
   * Requires admin permissions to monitor other users
   */
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to events for a specific user',
    filter: (payload: AuthEvent, variables: { userId: string }, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
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

  /**
   * Subscribe to all authentication events in tenant (admin only)
   * Provides comprehensive monitoring for security administrators
   */
  @Subscription(() => AuthEvent, {
    description: 'Subscribe to all authentication events in tenant',
    filter: (payload: AuthEvent, variables: any, context: any) => {
      const user = context.req?.user as AuthenticatedUser;
      if (!user) return false;
      return payload.tenantId === user.tenantId;
    },
  })
  @UseGuards(PermissionsGuard)
  @Permissions('security:admin')
  async allTenantAuthEvents(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(`auth.all.${user.tenantId}`, user.tenantId);
  }
}