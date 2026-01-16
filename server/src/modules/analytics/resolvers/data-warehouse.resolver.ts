import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { DataWarehouseService } from '../services/data-warehouse.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { DataCube } from '../types/analytics.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class DataWarehouseResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly dataWarehouseService: DataWarehouseService,
    private readonly cacheService: IntelligentCacheService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => String, { name: 'queryWarehouse' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async queryWarehouse(
    @Args('query') query: string,
    @CurrentUser() _user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    try {
      const result = await this.dataWarehouseService.executeAnalyticsQuery(tenantId, query, []);
      return JSON.stringify(result);
    } catch (error) {
      this.handleError(error, 'Failed to query warehouse');
      throw error;
    }
  }

  @Query(() => DataCube, { name: 'getDataCube' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getDataCube(
    @Args('cubeName') cubeName: string,
    @CurrentUser() _user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DataCube> {
    try {
      const cacheKey = `cube:${tenantId}:${cubeName}`;
      const cached = await this.cacheService.get(cacheKey);

      if (cached) {
        const cubeData = cached as any;
        return {
          id: cubeData.id || `cube_${cubeName}`,
          name: cubeData.name || cubeName,
          dimensions: cubeData.dimensions || [],
          measures: cubeData.measures || [],
          data: JSON.stringify(cubeData.data || {}),
        };
      }

      // Mock cube data
      const cubeData = {
        id: `cube_${cubeName}`,
        name: cubeName,
        dimensions: ['time', 'location', 'product'],
        measures: ['revenue', 'quantity', 'profit'],
        data: { values: [] },
      };

      await this.cacheService.set(cacheKey, cubeData, { ttl: 3600 });

      return {
        id: cubeData.id,
        name: cubeData.name,
        dimensions: cubeData.dimensions,
        measures: cubeData.measures,
        data: JSON.stringify(cubeData.data),
      };
    } catch (error) {
      this.handleError(error, 'Failed to get data cube');
      throw error;
    }
  }
}
