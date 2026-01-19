import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { AuthEventType, AuthEvent } from '../resolvers/auth-subscriptions.resolver';

/**
 * Auth Events Service
 * Handles publishing of authentication and authorization events
 * Integrates with both EventEmitter2 (for internal handlers) and PubSub (for GraphQL subscriptions)
 */
@Injectable()
export class AuthEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly pubSubService: PubSubService,
  ) {}

  /**
   * Publish authentication event
   */
  async publishAuthEvent(
    type: AuthEventType,
    userId: string,
    tenantId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: AuthEvent = {
      type,
      userId,
      tenantId,
      timestamp: new Date(),
      ...(metadata !== undefined && { metadata }),
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    };

    // Emit for internal event handlers
    this.eventEmitter.emit(`auth.${type.toLowerCase()}`, event);

    // Publish for GraphQL subscriptions
    await Promise.all([
      this.pubSubService.publish(`auth.user.${userId}`, event),
      this.pubSubService.publish(`auth.tenant.${tenantId}`, event),
    ]);

    // Publish to specific channels based on event type
    switch (type) {
      case AuthEventType.PERMISSION_GRANTED:
      case AuthEventType.PERMISSION_REVOKED:
      case AuthEventType.ROLE_ASSIGNED:
        await this.pubSubService.publish(`permissions.user.${userId}`, event);
        if (type === AuthEventType.ROLE_ASSIGNED) {
          await this.pubSubService.publish(`roles.tenant.${tenantId}`, event);
        }
        break;

      case AuthEventType.MFA_ENABLED:
      case AuthEventType.MFA_DISABLED:
        await this.pubSubService.publish(`mfa.user.${userId}`, event);
        break;

      case AuthEventType.SESSION_EXPIRED:
      case AuthEventType.USER_LOGIN:
      case AuthEventType.USER_LOGOUT:
        await this.pubSubService.publish(`sessions.user.${userId}`, event);
        break;

      case AuthEventType.FAILED_LOGIN_ATTEMPT:
      case AuthEventType.ACCOUNT_LOCKED:
      case AuthEventType.ACCOUNT_UNLOCKED:
        await this.pubSubService.publish(`security.tenant.${tenantId}`, event);
        break;
    }
  }

  /**
   * Publish user login event
   */
  async publishUserLogin(
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.USER_LOGIN,
      userId,
      tenantId,
      { sessionId },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Publish user logout event
   */
  async publishUserLogout(
    userId: string,
    tenantId: string,
    sessionId?: string,
    reason?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.USER_LOGOUT,
      userId,
      tenantId,
      { sessionId, reason },
    );
  }

  /**
   * Publish user registration event
   */
  async publishUserRegistered(
    userId: string,
    tenantId: string,
    email: string,
    role: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.USER_REGISTERED,
      userId,
      tenantId,
      { email, role },
    );
  }

  /**
   * Publish password change event
   */
  async publishPasswordChanged(
    userId: string,
    tenantId: string,
    changedBy?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.PASSWORD_CHANGED,
      userId,
      tenantId,
      { changedBy },
    );
  }

  /**
   * Publish MFA enabled event
   */
  async publishMfaEnabled(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.MFA_ENABLED,
      userId,
      tenantId,
    );
  }

  /**
   * Publish MFA disabled event
   */
  async publishMfaDisabled(
    userId: string,
    tenantId: string,
    method?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.MFA_DISABLED,
      userId,
      tenantId,
      { method },
    );
  }

  /**
   * Publish permission granted event
   */
  async publishPermissionGranted(
    userId: string,
    tenantId: string,
    permission: string,
    grantedBy: string,
    resource?: string,
    resourceId?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.PERMISSION_GRANTED,
      userId,
      tenantId,
      { permission, grantedBy, resource, resourceId },
    );
  }

  /**
   * Publish permission revoked event
   */
  async publishPermissionRevoked(
    userId: string,
    tenantId: string,
    permission: string,
    revokedBy: string,
    resource?: string,
    resourceId?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.PERMISSION_REVOKED,
      userId,
      tenantId,
      { permission, revokedBy, resource, resourceId },
    );
  }

  /**
   * Publish role assigned event
   */
  async publishRoleAssigned(
    userId: string,
    tenantId: string,
    role: string,
    previousRole: string,
    assignedBy: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.ROLE_ASSIGNED,
      userId,
      tenantId,
      { role, previousRole, assignedBy },
    );
  }

  /**
   * Publish session expired event
   */
  async publishSessionExpired(
    userId: string,
    tenantId: string,
    sessionId: string,
    reason?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.SESSION_EXPIRED,
      userId,
      tenantId,
      { sessionId, reason },
    );
  }

  /**
   * Publish failed login attempt event
   */
  async publishFailedLoginAttempt(
    email: string,
    tenantId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.FAILED_LOGIN_ATTEMPT,
      'unknown', // No user ID for failed attempts
      tenantId,
      { email, reason },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Publish account locked event
   */
  async publishAccountLocked(
    userId: string,
    tenantId: string,
    reason: string,
    lockoutDuration?: number,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.ACCOUNT_LOCKED,
      userId,
      tenantId,
      { reason, lockoutDuration },
    );
  }

  /**
   * Publish account unlocked event
   */
  async publishAccountUnlocked(
    userId: string,
    tenantId: string,
    unlockedBy?: string,
  ): Promise<void> {
    await this.publishAuthEvent(
      AuthEventType.ACCOUNT_UNLOCKED,
      userId,
      tenantId,
      { unlockedBy },
    );
  }
}