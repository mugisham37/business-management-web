import { Resolver, Query, Mutation, Args, ResolveField, Parent, Subscription, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '../services/product.service';
import { InventoryLevel, InventoryMovement } from '../types/inventory.types';
import { AdjustInventoryInput, TransferInventoryInput, InventoryFilterInput } from '../inputs/inventory.input';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => InventoryLevel)
@UseGuards(JwtAuthGuard)
export class InventoryResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => InventoryLevel, { description: 'Get inventory level for a product at a location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async getInventory(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryLevel> {
    return this.inventoryService.getInventoryLevel(tenantId, productId, variantId, locationId);
  }

  @Query(() => [InventoryLevel], { description: 'Get inventory levels with optional filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async getInventoryLevels(
    @Args('filter', { type: () => InventoryFilterInput, nullable: true }) filter: InventoryFilterInput | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryLevel[]> {
    const query = {
      ...filter,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
    };

    const result = await this.inventoryService.getInventoryLevels(tenantId, query);
    return result.inventoryLevels;
  }

  @Query(() => [InventoryMovement], { description: 'Get inventory movement history' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async getInventoryHistory(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryMovement[]> {
    return this.inventoryService.getInventoryMovements(tenantId, productId, locationId || undefined);
  }

  @Mutation(() => InventoryLevel, { description: 'Adjust inventory level' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async adjustInventory(
    @Args('input') input: AdjustInventoryInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<InventoryLevel> {
    const result = await this.inventoryService.adjustInventory(
      tenantId,
      {
        productId: input.productId,
        variantId: input.variantId,
        locationId: input.locationId,
        adjustment: input.adjustment,
        reason: input.reason,
        notes: input.notes,
      },
      user.id,
    );

    // Publish subscription event
    await this.pubSub.publish('INVENTORY_CHANGED', {
      inventoryChanged: {
        ...result,
        tenantId,
      },
    });

    return result;
  }

  @Mutation(() => Boolean, { description: 'Transfer inventory between locations' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async transferInventory(
    @Args('input') input: TransferInventoryInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.inventoryService.transferInventory(
      tenantId,
      {
        productId: input.productId,
        variantId: input.variantId,
        locationId: input.fromLocationId, // Not used in transfer but required by DTO
        fromLocationId: input.fromLocationId,
        toLocationId: input.toLocationId,
        quantity: input.quantity,
        notes: input.notes,
      },
      user.id,
    );

    // Publish subscription events for both locations
    await this.pubSub.publish('INVENTORY_CHANGED', {
      inventoryChanged: {
        productId: input.productId,
        variantId: input.variantId,
        locationId: input.fromLocationId,
        tenantId,
      },
    });

    await this.pubSub.publish('INVENTORY_CHANGED', {
      inventoryChanged: {
        productId: input.productId,
        variantId: input.variantId,
        locationId: input.toLocationId,
        tenantId,
      },
    });

    return true;
  }

  @ResolveField(() => Object, { nullable: true, description: 'Product information' })
  async product(
    @Parent() inventory: InventoryLevel,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'product_by_id',
      this.productService.batchLoadByIds.bind(this.productService),
    );
    return loader.load(inventory.productId);
  }

  @ResolveField(() => Object, { nullable: true, description: 'Location information' })
  async location(
    @Parent() inventory: InventoryLevel,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // Location service would be injected and used here
    // For now, return a placeholder
    return { id: inventory.locationId, name: 'Location' };
  }

  @Subscription(() => InventoryLevel, {
    description: 'Subscribe to inventory changes',
    filter: (payload, variables, context) => {
      // Filter by tenant
      if (payload.inventoryChanged.tenantId !== context.req.user.tenantId) {
        return false;
      }

      // Filter by product if specified
      if (variables.productId && payload.inventoryChanged.productId !== variables.productId) {
        return false;
      }

      // Filter by location if specified
      if (variables.locationId && payload.inventoryChanged.locationId !== variables.locationId) {
        return false;
      }

      return true;
    },
  })
  inventoryChanged(
    @Args('productId', { type: () => ID, nullable: true }) productId: string | null,
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSub.asyncIterator('INVENTORY_CHANGED');
  }
}
