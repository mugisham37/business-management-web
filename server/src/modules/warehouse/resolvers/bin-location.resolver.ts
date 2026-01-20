import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BinLocationService } from '../services/bin-location.service';
import { WarehouseZoneService } from '../services/warehouse-zone.service';
import { BinLocationType } from '../types/bin-location.types';
import { WarehouseZoneType } from '../types/warehouse-zone.types';

@Resolver(() => BinLocationType)
@UseGuards(JwtAuthGuard)
export class BinLocationResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly binLocationService: BinLocationService,
    private readonly zoneService: WarehouseZoneService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => BinLocationType, { name: 'binLocation' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getBinLocation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.binLocationService.getBinLocation(tenantId, id);
  }

  @Query(() => [BinLocationType], { name: 'binInventory' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getBinInventory(
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @Args('zoneId', { type: () => ID, nullable: true }) zoneId: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    if (zoneId) {
      return this.binLocationService.getBinLocationsByZone(tenantId, zoneId);
    }
    return this.binLocationService.getBinLocationsByWarehouse(tenantId, warehouseId);
  }

  @ResolveField(() => WarehouseZoneType, { name: 'zone' })
  async zone(
    @Parent() binLocation: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'zone_by_id',
      async (zoneIds: readonly string[]) => {
        const zones = await Promise.all(
          zoneIds.map(id => this.zoneService.getZone(tenantId, id))
        );
        return zones.map(zone => zone || new Error('Zone not found'));
      },
    );
    return loader.load(binLocation.zoneId);
  }
}
