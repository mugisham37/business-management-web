import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { MobileAnalyticsService } from '../services/mobile-analytics.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class MobileAnalyticsResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly mobileAnalyticsService: MobileAnalyticsService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => String, { name: 'getMobileMetrics' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getMobileMetrics(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    try {
      const metrics = await this.mobileAnalyticsService.getMobileMetrics(tenantId);
      return JSON.stringify(metrics);
    } catch (error) {
      this.handleError(error, 'Failed to get mobile metrics');
      throw error;
    }
  }

  @Query(() => String, { name: 'getUserBehavior' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getUserBehavior(
    @Args('userId') userId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    try {
      const behavior = await this.mobileAnalyticsService.getUserBehavior(tenantId, userId);
      return JSON.stringify(behavior);
    } catch (error) {
      this.handleError(error, 'Failed to get user behavior');
      throw error;
    }
  }

  @Query(() => String, { name: 'getSessionAnalytics' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getSessionAnalytics(
    @Args('sessionId') sessionId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    try {
      const analytics = await this.mobileAnalyticsService.getSessionAnalytics(tenantId, sessionId);
      return JSON.stringify(analytics);
    } catch (error) {
      this.handleError(error, 'Failed to get session analytics');
      throw error;
    }
  }
}
