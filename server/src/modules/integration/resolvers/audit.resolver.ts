import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../../tenant/interceptors/tenant.interceptor';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';

import { AuditService } from '../services/audit.service';

import {
  AuditLogType,
  AuditSummaryType,
  AuditAction,
} from '../types/audit.graphql.types';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => AuditLogType)
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class AuditResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly auditService: AuditService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [AuditLogType], { name: 'integrationAuditLogs' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:audit')
  async getIntegrationAuditLogs(
    @Args('integrationId') integrationId: string,
    @Args('action', { type: () => AuditAction, nullable: true }) action?: AuditAction,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args() pagination?: PaginationArgs,
    @CurrentTenant() tenantId?: string,
  ): Promise<AuditLogType[]> {
    return this.auditService.getIntegrationAuditLogs(integrationId, {
      action,
      startDate,
      endDate,
      ...pagination,
    });
  }

  @Query(() => AuditSummaryType, { name: 'integrationAuditSummary' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:audit')
  async getIntegrationAuditSummary(
    @Args('integrationId') integrationId: string,
    @Args('days', { defaultValue: 30 }) days: number,
    @CurrentTenant() tenantId: string,
  ): Promise<AuditSummaryType> {
    return this.auditService.getIntegrationAuditSummary(integrationId, days);
  }

  @Query(() => [AuditLogType], { name: 'userAuditLogs' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:audit')
  async getUserAuditLogs(
    @Args('userId') userId: string,
    @Args('integrationId', { nullable: true }) integrationId?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args() pagination?: PaginationArgs,
    @CurrentTenant() tenantId?: string,
  ): Promise<AuditLogType[]> {
    return this.auditService.getUserAuditLogs(userId, {
      integrationId,
      startDate,
      endDate,
      ...pagination,
    });
  }
}