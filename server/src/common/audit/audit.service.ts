import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface AuditLogData {
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure';
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditQueryFilters {
  organizationId: string;
  userId?: string;
  action?: string;
  resource?: string;
  outcome?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Audit Service for immutable security event logging
 * 
 * Features:
 * - Append-only audit logging (no updates/deletes)
 * - Automatic sensitive data masking
 * - Comprehensive event tracking
 * - Queryable audit trail with pagination
 * - Organization-scoped audit logs
 * 
 * Requirements: 15.1, 15.5, 15.7
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  // Sensitive field patterns to mask in audit logs
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /authorization/i,
    /api[_-]?key/i,
    /access[_-]?token/i,
    /refresh[_-]?token/i,
    /mfa[_-]?secret/i,
    /backup[_-]?code/i,
    /credit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i,
    /passwordHash/i,
    /refreshTokenHash/i,
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an audit event (append-only, immutable)
   * 
   * This method creates an immutable audit log record. Once created,
   * audit logs cannot be updated or deleted to maintain integrity.
   * 
   * @param data - Audit log data
   * @returns Created audit log record
   */
  async log(data: AuditLogData): Promise<any> {
    try {
      // Mask sensitive data in beforeState, afterState, and metadata
      const maskedData = {
        ...data,
        beforeState: data.beforeState ? this.maskSensitiveData(data.beforeState) : undefined,
        afterState: data.afterState ? this.maskSensitiveData(data.afterState) : undefined,
        metadata: data.metadata ? this.maskSensitiveData(data.metadata) : undefined,
      };

      // Create audit log record (append-only)
      const auditLog = await this.prisma.auditLog.create({
        data: {
          organizationId: maskedData.organizationId,
          userId: maskedData.userId,
          action: maskedData.action,
          resource: maskedData.resource,
          resourceId: maskedData.resourceId,
          outcome: maskedData.outcome,
          beforeState: maskedData.beforeState as Prisma.InputJsonValue,
          afterState: maskedData.afterState as Prisma.InputJsonValue,
          ipAddress: maskedData.ipAddress,
          userAgent: maskedData.userAgent,
          metadata: maskedData.metadata as Prisma.InputJsonValue,
        },
      });

      this.logger.debug(
        `Audit log created: ${data.action} on ${data.resource} (${data.outcome})`,
      );

      return auditLog;
    } catch (error) {
      // Log error but don't throw - audit logging should not break application flow
      this.logger.error('Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Query audit logs with filtering and pagination
   * 
   * @param filters - Query filters
   * @returns Paginated audit logs
   */
  async query(filters: AuditQueryFilters): Promise<PaginatedAuditLogs> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.AuditLogWhereInput = {
        organizationId: filters.organizationId,
      };

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.action) {
        where.action = filters.action;
      }

      if (filters.resource) {
        where.resource = filters.resource;
      }

      if (filters.outcome) {
        where.outcome = filters.outcome;
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

      // Execute query with pagination
      const [data, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to query audit logs:', error);
      throw error;
    }
  }

  /**
   * Mask sensitive data in objects recursively
   * 
   * @param data - Data to mask
   * @returns Masked data
   */
  private maskSensitiveData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle primitive types
    if (typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    // Handle objects
    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Check if key matches sensitive patterns
      if (this.isSensitiveField(key)) {
        masked[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively mask nested objects
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Check if a field name matches sensitive patterns
   * 
   * @param fieldName - Field name to check
   * @returns True if field is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    return AuditService.SENSITIVE_PATTERNS.some(pattern =>
      pattern.test(fieldName),
    );
  }
}
