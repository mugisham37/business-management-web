import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { CycleCountingService } from '../services/cycle-counting.service';
import { QueueService } from '../../queue/queue.service';
import { CycleCount, CycleCountItem, CycleCountSummary } from '../types/cycle-count.types';
import { CreateCycleCountInput, CountItemInput, CycleCountFilterInput } from '../inputs/cycle-count.input';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => CycleCount)
@UseGuards(JwtAuthGuard)
export class CycleCountingResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly cycleCountingService: CycleCountingService,
    private readonly queueService: QueueService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => CycleCount, { description: 'Get cycle count session by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async cycleCount(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCount> {
    return this.cycleCountingService.findSessionById(tenantId, id);
  }

  @Query(() => [CycleCount], { description: 'Get cycle count sessions with optional filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async cycleCounts(
    @Args('filter', { type: () => CycleCountFilterInput, nullable: true }) filter: CycleCountFilterInput | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCount[]> {
    const query = {
      ...filter,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
    };

    const result = await this.cycleCountingService.findSessions(tenantId, query);
    return result.sessions;
  }

  @Query(() => [CycleCountItem], { description: 'Get cycle count items for a session' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async cycleCountItems(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @Args('status', { type: () => String, nullable: true }) status: string | null,
    @Args('pagination', { type: () => PaginationArgs, nullable: true }) pagination: PaginationArgs | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountItem[]> {
    const query = {
      sessionId,
      status: status || undefined,
      page: pagination?.page || 1,
      limit: pagination?.limit || 50,
    };

    const result = await this.cycleCountingService.findCountItems(tenantId, query);
    return result.items;
  }

  @Query(() => CycleCountSummary, { description: 'Get cycle count session summary' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async cycleCountSummary(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountSummary> {
    return this.cycleCountingService.getSessionSummary(tenantId, sessionId);
  }

  @Query(() => [CycleCountItem], { description: 'Get variance report for cycle count session' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async cycleCountVariances(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountItem[]> {
    return this.cycleCountingService.getVarianceReport(tenantId, sessionId);
  }

  @Mutation(() => CycleCount, { description: 'Create new cycle count session' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create')
  async createCycleCount(
    @Args('input') input: CreateCycleCountInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCount> {
    return this.cycleCountingService.createStockCountSession(tenantId, input, user.id);
  }

  @Mutation(() => CycleCount, { description: 'Start cycle count session' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async startCycleCount(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCount> {
    return this.cycleCountingService.startStockCountSession(tenantId, sessionId, user.id);
  }

  @Mutation(() => CycleCountItem, { description: 'Record count for an item' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async recordCount(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('input') input: CountItemInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountItem> {
    return this.cycleCountingService.countItem(tenantId, sessionId, itemId, input, user.id);
  }

  @Mutation(() => CycleCount, { description: 'Complete cycle count session' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async completeCycleCount(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCount> {
    const session = await this.cycleCountingService.completeStockCountSession(tenantId, sessionId, user.id);

    // Enqueue variance analysis to Bull queue
    await this.queueService.addJob('inventory-variance-analysis', {
      tenantId,
      sessionId,
      userId: user.id,
    });

    return session;
  }

  @Mutation(() => CycleCountItem, { description: 'Adjust inventory from count variance' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async adjustFromCount(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @Args('itemId', { type: () => ID }) itemId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountItem> {
    return this.cycleCountingService.adjustInventoryFromCount(tenantId, sessionId, itemId, user.id);
  }

  @ResolveField(() => [CycleCountItem], { description: 'Items in this cycle count session' })
  async items(
    @Parent() cycleCount: CycleCount,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountItem[]> {
    const result = await this.cycleCountingService.findCountItems(tenantId, {
      sessionId: cycleCount.id,
      page: 1,
      limit: 100,
    });
    return result.items;
  }

  @ResolveField(() => CycleCountSummary, { description: 'Summary statistics for this cycle count' })
  async summary(
    @Parent() cycleCount: CycleCount,
    @CurrentTenant() tenantId: string,
  ): Promise<CycleCountSummary> {
    return this.cycleCountingService.getSessionSummary(tenantId, cycleCount.id);
  }
}
