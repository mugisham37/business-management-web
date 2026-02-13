import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { UserRole } from '../tenant/tenant-context.interface';

export interface LoginMetadata {
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface FailureMetadata {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Log a user login event
   * Requirement 11.1: Record user_id, organization_id, timestamp, IP address, and user agent
   */
  async logLogin(
    userId: string,
    organizationId: string,
    metadata: LoginMetadata,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: userId,
          metadata: {
            success: metadata.success,
          },
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log login event: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a user creation event
   * Requirement 11.2: Record creator_id, created_user_id, role, and timestamp
   */
  async logUserCreation(
    creatorId: string,
    createdUserId: string,
    role: UserRole,
    organizationId?: string,
  ): Promise<void> {
    try {
      const orgId = organizationId || this.tryGetOrganizationId();

      if (!orgId) {
        this.logger.warn('Cannot log user creation without organization ID');
        return;
      }

      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId: creatorId,
          action: 'USER_CREATED',
          entityType: 'USER',
          entityId: createdUserId,
          metadata: {
            creatorId,
            createdUserId,
            role,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log user creation: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a permission change event (grant or revoke)
   * Requirement 11.3: Record grantor_id, grantee_id, permissions, action, and timestamp
   */
  async logPermissionChange(
    grantorId: string,
    granteeId: string,
    action: 'GRANT' | 'REVOKE',
    permissions: string[],
  ): Promise<void> {
    try {
      const organizationId = this.tenantContext.getOrganizationId();

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId: grantorId,
          action: `PERMISSION_${action}`,
          entityType: 'USER_PERMISSION',
          entityId: granteeId,
          metadata: {
            grantorId,
            granteeId,
            permissions,
            action,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log permission change: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a role change event
   * Requirement 11.4: Record the change with old_role, new_role, and modifier_id
   */
  async logRoleChange(
    modifierId: string,
    userId: string,
    oldRole: UserRole,
    newRole: UserRole,
  ): Promise<void> {
    try {
      const organizationId = this.tenantContext.getOrganizationId();

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId: modifierId,
          action: 'ROLE_CHANGED',
          entityType: 'USER',
          entityId: userId,
          metadata: {
            modifierId,
            targetUserId: userId,
            oldRole,
            newRole,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log role change: ${error.message}`, error.stack);
    }
  }

  /**
   * Log an authentication failure event
   * Requirement 11.5: Record email, failure_reason, IP address, and timestamp
   */
  async logAuthFailure(
    email: string,
    reason: string,
    metadata: FailureMetadata,
    organizationId?: string,
  ): Promise<void> {
    try {
      // For auth failures, we might not have tenant context yet
      const orgId = organizationId || this.tryGetOrganizationId();

      if (!orgId) {
        this.logger.warn('Cannot log auth failure without organization ID');
        return;
      }

      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId: null, // No user ID for failed auth
          action: 'AUTH_FAILURE',
          entityType: 'USER',
          entityId: null,
          metadata: {
            email,
            reason,
            timestamp: metadata.timestamp,
          },
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log auth failure: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a token rotation event
   * Requirement 11.6: Record user_id, old_token_id, new_token_id, and timestamp
   */
  async logTokenRotation(
    userId: string,
    oldTokenId: string,
    newTokenId: string,
  ): Promise<void> {
    try {
      const organizationId = this.tenantContext.getOrganizationId();

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'TOKEN_ROTATED',
          entityType: 'REFRESH_TOKEN',
          entityId: newTokenId,
          metadata: {
            userId,
            oldTokenId,
            newTokenId,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log token rotation: ${error.message}`, error.stack);
    }
  }

  /**
   * Log an MFA change event (enable or disable)
   * Requirement 11.7: Record user_id, action, and timestamp
   */
  async logMFAChange(userId: string, action: 'ENABLE' | 'DISABLE'): Promise<void> {
    try {
      const organizationId = this.tenantContext.getOrganizationId();

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action: `MFA_${action}`,
          entityType: 'USER',
          entityId: userId,
          metadata: {
            userId,
            action,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log MFA change: ${error.message}`, error.stack);
    }
  }

  /**
   * Log a scope change event (branch or department assignment)
   * Requirement 11.8: Record user_id, entity_type, entity_id, action, and timestamp
   */
  async logScopeChange(
    userId: string,
    entityType: 'BRANCH' | 'DEPARTMENT',
    entityId: string,
    action: 'ASSIGN' | 'REVOKE',
  ): Promise<void> {
    try {
      const organizationId = this.tenantContext.getOrganizationId();

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action: `SCOPE_${action}`,
          entityType,
          entityId,
          metadata: {
            userId,
            entityType,
            entityId,
            action,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log scope change: ${error.message}`, error.stack);
    }
  }

  /**
   * Query audit logs with filters
   * Requirement 11.9: Filter by organization_id to maintain tenant isolation
   */
  async getAuditLogs(
    organizationId: string,
    filters: AuditLogFilters = {},
  ): Promise<any[]> {
    const where: any = {
      organizationId,
    };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit || 100,
      skip: filters.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get user activity within a date range
   * Requirement 11.9: Query audit logs for specific user
   */
  async getUserActivity(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const organizationId = this.tenantContext.getOrganizationId();

    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Helper method to safely get organization ID
   * Returns null if tenant context is not set (e.g., during auth failures)
   */
  private tryGetOrganizationId(): string | null {
    try {
      return this.tenantContext.getOrganizationId();
    } catch {
      return null;
    }
  }
}
