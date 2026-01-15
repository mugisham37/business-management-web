import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { PickingWaveService } from '../services/picking-wave.service';
import { QueueService } from '../../queue/queue.service';
import { 
  PickingWaveType,
  PickingWaveConnection,
  CreatePickingWaveInput,
} from '../types/picking-wave.types';

@Resolver(() => PickingWaveType)
@UseGuards(JwtAuthGuard)
export class PickingWaveResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly pickingWaveService: PickingWaveService,
    private readonly queueService: QueueService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => PickingWaveType, { name: 'pickingWave' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getPickingWave(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.pickingWaveService.getWave(tenantId, id);
  }

  @Query(() => PickingWaveConnection, { name: 'pickingWaves' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getPickingWaves(
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('warehouseId', { type: () => ID, nullable: true }) warehouseId: string,
    @Args('status', { type: () => String, nullable: true }) status: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const { limit } = this.parsePaginationArgs({ first, after });
    
    const result = await this.pickingWaveService.getWaves(tenantId, {
      warehouseId,
      status,
      page: 1,
      limit,
    });
    
    return {
      edges: this.createEdges(result.waves, wave => wave.id),
      pageInfo: this.createPageInfo(
        result.page < result.totalPages,
        result.page > 1,
        result.waves[0]?.id,
        result.waves[result.waves.length - 1]?.id,
      ),
      totalCount: result.total,
    };
  }

  @Query(() => String, { name: 'waveProgress', description: 'Get wave progress as JSON' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getWaveProgress(
    @Args('waveId', { type: () => ID }) waveId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    const progress = await this.pickingWaveService.getWaveProgress(tenantId, waveId);
    return JSON.stringify(progress);
  }

  @Mutation(() => PickingWaveType, { name: 'createPickingWave' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createPickingWave(
    @Args('input') input: CreatePickingWaveInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.pickingWaveService.createWave(tenantId, input, user.id);
  }

  @Mutation(() => PickingWaveType, { name: 'releasePickingWave' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async releasePickingWave(
    @Args('waveId', { type: () => ID }) waveId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // Enqueue wave optimization to Bull queue
    await this.queueService.add('optimize-picking-wave', {
      tenantId,
      waveId,
      userId: user.id,
    });

    return this.pickingWaveService.releaseWave(tenantId, waveId, user.id);
  }
}
