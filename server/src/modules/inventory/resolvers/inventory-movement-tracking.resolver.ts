import { Resolver, Query, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { InventoryMovementTrackingService } from '../services/inventory-movement-tracking.service';
import { ProductService } from '../services/product.service';
import { InventoryMovement } from '../types/inventory-movement.types';
import { MovementFilterInput } from '../inputs/movement.input';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => InventoryMovement)
@UseGuards(JwtAuthGuard)
export class InventoryMovementTrackingResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly movementTrackingService: InventoryMovementTrackingService,
    private readonly productService: ProductService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [InventoryMovement], { description: 'Get inventory movements with filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryMovements(
    @Args('filter', { type: () => MovementFilterInput, nullable: true }) filter: MovementFilterInput | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryMovement[]> {
    const query = {
      ...filter,
      page: pagination?.page || 1,
      limit: pagination?.limit || 50,
    };

    const result = await this.movementTrackingService.getMovements(tenantId, query);
    return result.movements;
  }

  @Query(() => [InventoryMovement], { description: 'Get movement history for a product' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async productMovementHistory(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId: string | null,
    @Args('startDate', { type: () => Date, nullable: true }) startDate: Date | null,
    @Args('endDate', { type: () => Date, nullable: true }) endDate: Date | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryMovement[]> {
    return this.movementTrackingService.getProductMovementHistory(
      tenantId,
      productId,
      variantId || undefined,
      startDate || undefined,
      endDate || undefined,
    );
  }

  @Query(() => [InventoryMovement], { description: 'Get movements for a location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async locationMovements(
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate: Date | null,
    @Args('endDate', { type: () => Date, nullable: true }) endDate: Date | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryMovement[]> {
    const query = {
      locationId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: pagination?.page || 1,
      limit: pagination?.limit || 50,
    };

    const result = await this.movementTrackingService.getLocationMovements(tenantId, query);
    return result.movements;
  }

  @ResolveField(() => Object, { nullable: true, description: 'Product information' })
  async product(
    @Parent() movement: InventoryMovement,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'product_by_id',
      this.productService.batchLoadByIds.bind(this.productService),
    );
    return loader.load(movement.productId);
  }

  @ResolveField(() => Object, { nullable: true, description: 'From location information' })
  async fromLocation(
    @Parent() movement: InventoryMovement,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    if (!movement.fromLocationId) {
      return null;
    }
    // Location service would be injected and used here
    return { id: movement.fromLocationId, name: 'From Location' };
  }

  @ResolveField(() => Object, { nullable: true, description: 'To location information' })
  async toLocation(
    @Parent() movement: InventoryMovement,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    if (!movement.toLocationId) {
      return null;
    }
    // Location service would be injected and used here
    return { id: movement.toLocationId, name: 'To Location' };
  }
}
