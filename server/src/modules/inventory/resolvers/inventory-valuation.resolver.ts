import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { InventoryValuationService, ValuationResult, ValuationSummary } from '../services/inventory-valuation.service';
import { 
  InventoryValuationResult, 
  InventoryValuationSummary,
  ValuationMethod 
} from '../types/inventory-valuation.types';

// Mapping functions
function mapValuationResult(result: ValuationResult): InventoryValuationResult {
  const mapped: InventoryValuationResult = {
    productId: result.productId,
    locationId: result.locationId,
    currentQuantity: result.currentQuantity,
    valuationMethod: result.valuationMethod as ValuationMethod,
    unitCost: result.unitCost,
    totalValue: result.totalValue,
  };

  if (result.variantId) {
    mapped.variantId = result.variantId;
  }

  if (result.batches) {
    mapped.batches = result.batches;
  }

  return mapped;
}

function mapValuationSummary(summary: ValuationSummary): InventoryValuationSummary {
  return {
    totalInventoryValue: summary.totalInventoryValue,
    totalQuantity: summary.totalQuantity,
    averageCost: summary.averageCost,
    valuationsByLocation: summary.valuationsByLocation,
    valuationsByProduct: summary.valuationsByProduct,
  };
}

@Resolver(() => InventoryValuationResult)
@UseGuards(JwtAuthGuard)
export class InventoryValuationResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly valuationService: InventoryValuationService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [InventoryValuationResult], { description: 'Get inventory valuation results' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async inventoryValuation(
    @CurrentTenant() tenantId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
    @Args('productId', { type: () => ID, nullable: true }) productId?: string,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('valuationMethod', { type: () => ValuationMethod, nullable: true }) valuationMethod?: ValuationMethod,
    @Args('asOfDate', { nullable: true }) asOfDate?: Date,
    @Args('includeZeroQuantity', { defaultValue: false }) includeZeroQuantity?: boolean,
  ): Promise<InventoryValuationResult[]> {
    const query: any = {};
    
    if (locationId !== undefined) query.locationId = locationId;
    if (productId !== undefined) query.productId = productId;
    if (categoryId !== undefined) query.categoryId = categoryId;
    if (valuationMethod !== undefined) query.valuationMethod = valuationMethod;
    if (asOfDate !== undefined) query.asOfDate = asOfDate;
    if (includeZeroQuantity !== undefined) query.includeZeroQuantity = includeZeroQuantity;

    const results = await this.valuationService.calculateInventoryValuation(tenantId, query);
    return results.map(mapValuationResult);
  }

  @Query(() => InventoryValuationSummary, { description: 'Get inventory valuation summary' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async inventoryValuationSummary(
    @CurrentTenant() tenantId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
    @Args('productId', { type: () => ID, nullable: true }) productId?: string,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('valuationMethod', { type: () => ValuationMethod, nullable: true }) valuationMethod?: ValuationMethod,
    @Args('asOfDate', { nullable: true }) asOfDate?: Date,
    @Args('includeZeroQuantity', { defaultValue: false }) includeZeroQuantity?: boolean,
  ): Promise<InventoryValuationSummary> {
    const query: any = {};
    
    if (locationId !== undefined) query.locationId = locationId;
    if (productId !== undefined) query.productId = productId;
    if (categoryId !== undefined) query.categoryId = categoryId;
    if (valuationMethod !== undefined) query.valuationMethod = valuationMethod;
    if (asOfDate !== undefined) query.asOfDate = asOfDate;
    if (includeZeroQuantity !== undefined) query.includeZeroQuantity = includeZeroQuantity;

    const summary = await this.valuationService.getValuationSummary(tenantId, query);
    return mapValuationSummary(summary);
  }

  @Query(() => InventoryValuationResult, { description: 'Calculate product valuation', nullable: true })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async productValuation(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('valuationMethod', { type: () => ValuationMethod }) valuationMethod: ValuationMethod,
    @CurrentTenant() tenantId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId?: string,
    @Args('asOfDate', { nullable: true }) asOfDate?: Date,
  ): Promise<InventoryValuationResult | null> {
    const result = await this.valuationService.calculateProductValuation(
      tenantId,
      productId,
      variantId || null,
      locationId,
      valuationMethod,
      asOfDate,
    );
    
    return result ? mapValuationResult(result) : null;
  }

  @Mutation(() => Boolean, { description: 'Update inventory valuation' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:update')
  async updateInventoryValuation(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @CurrentTenant() tenantId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId?: string,
  ): Promise<boolean> {
    await this.valuationService.updateInventoryValuation(
      tenantId, 
      productId, 
      variantId || null, 
      locationId
    );
    return true;
  }
}