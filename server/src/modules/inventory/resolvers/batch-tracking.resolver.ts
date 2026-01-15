import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { BatchTrackingService } from '../services/batch-tracking.service';
import { ProductService } from '../services/product.service';
import { Batch, BatchMovement } from '../types/batch.types';
import { CreateBatchInput, UpdateBatchInput, BatchFilterInput } from '../inputs/batch.input';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => Batch)
@UseGuards(JwtAuthGuard)
export class BatchTrackingResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly batchTrackingService: BatchTrackingService,
    private readonly productService: ProductService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Batch, { description: 'Get batch by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async batch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.findById(tenantId, id);
  }

  @Query(() => [Batch], { description: 'Get batches with optional filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async batches(
    @Args('filter', { type: () => BatchFilterInput, nullable: true }) filter: BatchFilterInput | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch[]> {
    const query = {
      ...filter,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
    };

    const result = await this.batchTrackingService.findBatches(tenantId, query);
    return result.batches;
  }

  @Query(() => Batch, { description: 'Get batch by batch number' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async batchByNumber(
    @Args('batchNumber') batchNumber: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.findByBatchNumber(tenantId, batchNumber, locationId);
  }

  @Query(() => [Batch], { description: 'Get batches expiring within specified days' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async expiringBatches(
    @Args('daysAhead', { type: () => Int, defaultValue: 30 }) daysAhead: number,
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch[]> {
    return this.batchTrackingService.getExpiringBatches(tenantId, daysAhead, locationId || undefined);
  }

  @Query(() => [Batch], { description: 'Get FIFO batches for product at location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async fifoBatches(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId: string | null,
    @Args('locationId', { type: () => ID }) locationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch[]> {
    return this.batchTrackingService.getFIFOBatches(tenantId, productId, variantId, locationId);
  }

  @Query(() => [BatchMovement], { description: 'Get batch movement history' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async batchHistory(
    @Args('batchId', { type: () => ID }) batchId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BatchMovement[]> {
    return this.batchTrackingService.getBatchHistory(tenantId, batchId);
  }

  @Query(() => [Batch], { description: 'Trace batch across all locations' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async traceBatch(
    @Args('batchNumber') batchNumber: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch[]> {
    const batches = await this.batchTrackingService.findBatches(tenantId, { batchNumber });
    return batches.batches;
  }

  @Mutation(() => Batch, { description: 'Create new batch' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create')
  async createBatch(
    @Args('input') input: CreateBatchInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.createBatch(tenantId, input, user.id);
  }

  @Mutation(() => Batch, { description: 'Update batch information' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async updateBatch(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBatchInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.update(tenantId, id, input, user.id);
  }

  @Mutation(() => Batch, { description: 'Consume quantity from batch' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async consumeBatch(
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('quantity', { type: () => Float }) quantity: number,
    @Args('reason') reason: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.consumeBatch(tenantId, batchId, quantity, reason, user.id);
  }

  @Mutation(() => [Batch], { description: 'Recall batch across all locations' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async recallBatch(
    @Args('batchNumber') batchNumber: string,
    @Args('reason') reason: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch[]> {
    return this.batchTrackingService.recallBatch(tenantId, batchNumber, reason, user.id);
  }

  @Mutation(() => Batch, { description: 'Update batch quality status' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async updateBatchQuality(
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('qualityStatus', { type: () => String }) qualityStatus: 'approved' | 'rejected' | 'quarantine' | 'testing',
    @Args('qualityNotes') qualityNotes: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Batch> {
    return this.batchTrackingService.updateQualityStatus(tenantId, batchId, qualityStatus, qualityNotes, user.id);
  }

  @ResolveField(() => Object, { nullable: true, description: 'Product information' })
  async product(
    @Parent() batch: Batch,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'product_by_id',
      this.productService.batchLoadByIds.bind(this.productService),
    );
    return loader.load(batch.productId);
  }

  @ResolveField(() => [BatchMovement], { description: 'Batch movement history' })
  async movements(
    @Parent() batch: Batch,
    @CurrentTenant() tenantId: string,
  ): Promise<BatchMovement[]> {
    return this.batchTrackingService.getBatchHistory(tenantId, batch.id);
  }
}
