import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { ReorderService } from '../services/reorder.service';
import { ProductService } from '../services/product.service';
import { ReorderPoint, ReorderSuggestion } from '../types/reorder.types';
import { UpdateReorderPointInput, CreatePurchaseOrderInput } from '../inputs/reorder.input';

@Resolver(() => ReorderPoint)
@UseGuards(JwtAuthGuard)
export class ReorderResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly reorderService: ReorderService,
    private readonly productService: ProductService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [ReorderPoint], { description: 'Get reorder points for products' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async reorderPoints(
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @Args('productId', { type: () => ID, nullable: true }) productId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ReorderPoint[]> {
    return this.reorderService.getReorderPoints(
      tenantId,
      locationId || undefined,
      productId || undefined,
    );
  }

  @Query(() => [ReorderSuggestion], { description: 'Get reorder suggestions based on current inventory levels' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async reorderSuggestions(
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ReorderSuggestion[]> {
    return this.reorderService.getReorderSuggestions(
      tenantId,
      locationId || undefined,
    );
  }

  @Mutation(() => ReorderPoint, { description: 'Update reorder point for product at location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async updateReorderPoint(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId: string | null,
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('input') input: UpdateReorderPointInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ReorderPoint> {
    return this.reorderService.updateReorderPoint(
      tenantId,
      productId,
      variantId || undefined,
      locationId,
      input,
      user.id,
    );
  }

  @Mutation(() => String, { description: 'Create purchase order from reorder suggestion' })
  @UseGuards(PermissionsGuard)
  @Permissions('purchase-order:create')
  async createPurchaseOrderFromReorder(
    @Args('input') input: CreatePurchaseOrderInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    const purchaseOrder = await this.reorderService.createPurchaseOrder(
      tenantId,
      input,
      user.id,
    );
    return purchaseOrder.id;
  }

  @ResolveField(() => Object, { nullable: true, description: 'Product information' })
  async product(
    @Parent() reorderPoint: ReorderPoint,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'product_by_id',
      this.productService.batchLoadByIds.bind(this.productService),
    );
    return loader.load(reorderPoint.productId);
  }

  @ResolveField(() => Object, { nullable: true, description: 'Supplier information' })
  async supplier(
    @Parent() reorderPoint: ReorderPoint,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    if (!reorderPoint.supplierId) {
      return null;
    }
    // Supplier service would be injected and used here
    return { id: reorderPoint.supplierId, name: 'Supplier' };
  }
}
