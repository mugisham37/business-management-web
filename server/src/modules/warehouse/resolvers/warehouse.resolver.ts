import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { WarehouseService } from '../services/warehouse.service';
import { WarehouseZoneService } from '../services/warehouse-zone.service';
import { BinLocationService } from '../services/bin-location.service';
import { 
  WarehouseType, 
  WarehouseConnection,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehouseFilterInput,
} from '../types/warehouse.types';
import { WarehouseZoneType } from '../types/warehouse-zone.types';
import { BinLocationType } from '../types/bin-location.types';
import { EmployeeType } from '../../employee/types/employee.types';

@Resolver(() => WarehouseType)
@UseGuards(JwtAuthGuard)
export class WarehouseResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly warehouseService: WarehouseService,
    private readonly zoneService: WarehouseZoneService,
    private readonly binLocationService: BinLocationService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => WarehouseType, { name: 'warehouse' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.warehouseService.getWarehouse(tenantId, id);
  }

  @Query(() => WarehouseConnection, { name: 'warehouses' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getWarehouses(
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('filter', { type: () => WarehouseFilterInput, nullable: true }) filter: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const { limit, cursor, isForward } = this.parsePaginationArgs({ first, after });
    
    const query = {
      page: 1,
      limit,
      ...filter,
    };

    const result = await this.warehouseService.getWarehouses(tenantId, query);
    
    return {
      edges: this.createEdges(result.warehouses, warehouse => warehouse.id),
      pageInfo: this.createPageInfo(
        result.page < result.totalPages,
        result.page > 1,
        result.warehouses[0]?.id,
        result.warehouses[result.warehouses.length - 1]?.id,
      ),
      totalCount: result.total,
    };
  }

  @Mutation(() => WarehouseType, { name: 'createWarehouse' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createWarehouse(
    @Args('input') input: CreateWarehouseInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.warehouseService.createWarehouse(tenantId, input, user.id);
  }

  @Mutation(() => WarehouseType, { name: 'updateWarehouse' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async updateWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWarehouseInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.warehouseService.updateWarehouse(tenantId, id, input, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteWarehouse' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:delete')
  async deleteWarehouse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.warehouseService.deleteWarehouse(tenantId, id, user.id);
    return true;
  }

  @ResolveField(() => [WarehouseZoneType], { name: 'zones' })
  async zones(
    @Parent() warehouse: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    const loader = this.getDataLoader(
      'warehouse_zones_by_warehouse',
      async (warehouseIds: readonly string[]) => {
        return this.zoneService.batchLoadByWarehouseIds(warehouseIds as string[]);
      },
    );
    return loader.load(warehouse.id);
  }

  @ResolveField(() => [BinLocationType], { name: 'inventory' })
  async inventory(
    @Parent() warehouse: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    const loader = this.getDataLoader(
      'bin_locations_by_warehouse',
      async (warehouseIds: readonly string[]) => {
        return this.binLocationService.batchLoadByWarehouseIds(warehouseIds as string[]);
      },
    );
    return loader.load(warehouse.id);
  }

  @ResolveField(() => [EmployeeType], { name: 'employees', nullable: true })
  async employees(
    @Parent() warehouse: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    // This would typically load employees assigned to this warehouse
    // For now, return empty array as employee assignment logic may vary
    return [];
  }
}
