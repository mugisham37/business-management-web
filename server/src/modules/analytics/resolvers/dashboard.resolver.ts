import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { AnalyticsAPIService } from '../services/analytics-api.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { Dashboard, WidgetData } from '../types/analytics.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class DashboardResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly analyticsAPIService: AnalyticsAPIService,
    private readonly cacheService: IntelligentCacheService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Dashboard, { name: 'getDashboard' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getDashboard(
    @Args('dashboardId', { type: () => ID }) dashboardId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Dashboard> {
    try {
      const { dashboard } = await this.analyticsAPIService.getDashboardData(tenantId, dashboardId);
      return {
        id: dashboard.id,
        tenantId: dashboard.tenantId,
        name: dashboard.name,
        description: dashboard.description,
        widgets: dashboard.widgets.map(w => ({
          id: w.id,
          title: w.title,
          type: w.type,
          data: JSON.stringify(w),
          x: w.position.x,
          y: w.position.y,
          width: w.position.width,
          height: w.position.height,
        })),
        isPublic: dashboard.isPublic,
        createdAt: dashboard.createdAt,
        updatedAt: dashboard.updatedAt,
        deletedAt: undefined,
        createdBy: dashboard.createdBy,
        updatedBy: undefined,
        version: 1,
      };
    } catch (error) {
      this.handleError(error, 'Failed to get dashboard');
      throw error;
    }
  }

  @Query(() => WidgetData, { name: 'getWidgetData' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getWidgetData(
    @Args('dashboardId', { type: () => ID }) dashboardId: string,
    @Args('widgetId', { type: () => ID }) widgetId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<WidgetData> {
    try {
      const cacheKey = `widget:${tenantId}:${dashboardId}:${widgetId}`;
      let data = await this.cacheService.get(cacheKey);
      let fromCache = true;

      if (!data) {
        const { widgetData } = await this.analyticsAPIService.getDashboardData(tenantId, dashboardId);
        data = widgetData[widgetId];
        await this.cacheService.set(cacheKey, data, { ttl: 300 }); // 5-minute TTL
        fromCache = false;
      }

      return {
        widgetId,
        data: JSON.stringify(data),
        updatedAt: new Date(),
        fromCache,
      };
    } catch (error) {
      this.handleError(error, 'Failed to get widget data');
      throw error;
    }
  }

  @Mutation(() => Dashboard, { name: 'updateDashboard' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:write')
  async updateDashboard(
    @Args('dashboardId', { type: () => ID }) dashboardId: string,
    @Args('name', { nullable: true }) name: string,
    @Args('description', { nullable: true }) description: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Dashboard> {
    try {
      const { dashboard } = await this.analyticsAPIService.getDashboardData(tenantId, dashboardId);
      const updated = await this.analyticsAPIService.saveDashboard(
        tenantId,
        {
          ...dashboard,
          name: name || dashboard.name,
          description: description || dashboard.description,
        },
        user.id
      );

      return {
        id: updated.id,
        tenantId: updated.tenantId,
        name: updated.name,
        description: updated.description,
        widgets: updated.widgets.map(w => ({
          id: w.id,
          title: w.title,
          type: w.type,
          data: JSON.stringify(w),
          x: w.position.x,
          y: w.position.y,
          width: w.position.width,
          height: w.position.height,
        })),
        isPublic: updated.isPublic,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        deletedAt: undefined,
        createdBy: updated.createdBy,
        updatedBy: user.id,
        version: 1,
      };
    } catch (error) {
      this.handleError(error, 'Failed to update dashboard');
      throw error;
    }
  }
}
