import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomLoggerService } from '../../logger/logger.service';

/**
 * Auth Events Service
 * Handles publishing of authentication and authorization events
 * Integrates with EventEmitter2 for internal handlers and future GraphQL subscriptions
 */
@Injectable()
export class AuthEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('AuthEventsService');
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
    const event = {
      type: 'USER_LOGIN',
      userId,
      tenantId,
      sessionId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.user_login', event);
    this.logger.log(`User login event published`, { userId, tenantId, sessionId });
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
    const event = {
      type: 'USER_LOGOUT',
      userId,
      tenantId,
      sessionId,
      reason,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.user_logout', event);
    this.logger.log(`User logout event published`, { userId, tenantId, sessionId, reason });
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
    const event = {
      type: 'USER_REGISTERED',
      userId,
      tenantId,
      email,
      role,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.user_registered', event);
    this.logger.log(`User registration event published`, { userId, tenantId, email, role });
  }

  /**
   * Publish password change event
   */
  async publishPasswordChanged(
    userId: string,
    tenantId: string,
    changedBy?: string,
  ): Promise<void> {
    const event = {
      type: 'PASSWORD_CHANGED',
      userId,
      tenantId,
      changedBy,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.password_changed', event);
    this.logger.log(`Password change event published`, { userId, tenantId, changedBy });
  }

  /**
   * Publish MFA enabled event
   */
  async publishMfaEnabled(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const event = {
      type: 'MFA_ENABLED',
      userId,
      tenantId,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.mfa_enabled', event);
    this.logger.log(`MFA enabled event published`, { userId, tenantId });
  }

  /**
   * Publish MFA disabled event
   */
  async publishMfaDisabled(
    userId: string,
    tenantId: string,
    method?: string,
  ): Promise<void> {
    const event = {
      type: 'MFA_DISABLED',
      userId,
      tenantId,
      method,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.mfa_disabled', event);
    this.logger.log(`MFA disabled event published`, { userId, tenantId, method });
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
    const event = {
      type: 'PERMISSION_GRANTED',
      userId,
      tenantId,
      permission,
      grantedBy,
      resource,
      resourceId,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.permission_granted', event);
    this.logger.log(`Permission granted event published`, { userId, tenantId, permission, grantedBy });
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
    const event = {
      type: 'PERMISSION_REVOKED',
      userId,
      tenantId,
      permission,
      revokedBy,
      resource,
      resourceId,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.permission_revoked', event);
    this.logger.log(`Permission revoked event published`, { userId, tenantId, permission, revokedBy });
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
    const event = {
      type: 'ROLE_ASSIGNED',
      userId,
      tenantId,
      role,
      previousRole,
      assignedBy,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.role_assigned', event);
    this.logger.log(`Role assigned event published`, { userId, tenantId, role, previousRole, assignedBy });
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
    const event = {
      type: 'SESSION_EXPIRED',
      userId,
      tenantId,
      sessionId,
      reason,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.session_expired', event);
    this.logger.log(`Session expired event published`, { userId, tenantId, sessionId, reason });
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
    const event = {
      type: 'FAILED_LOGIN_ATTEMPT',
      email,
      tenantId,
      reason,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.failed_login_attempt', event);
    this.logger.warn(`Failed login attempt event published`, { email, tenantId, reason, ipAddress });
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
    const event = {
      type: 'ACCOUNT_LOCKED',
      userId,
      tenantId,
      reason,
      lockoutDuration,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.account_locked', event);
    this.logger.warn(`Account locked event published`, { userId, tenantId, reason, lockoutDuration });
  }

  /**
   * Publish account unlocked event
   */
  async publishAccountUnlocked(
    userId: string,
    tenantId: string,
    unlockedBy?: string,
  ): Promise<void> {
    const event = {
      type: 'ACCOUNT_UNLOCKED',
      userId,
      tenantId,
      unlockedBy,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('auth.account_unlocked', event);
    this.logger.log(`Account unlocked event published`, { userId, tenantId, unlockedBy });
  }
}