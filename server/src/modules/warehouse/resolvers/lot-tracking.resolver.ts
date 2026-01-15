import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { LotTrackingService } from '../services/lot-tracking.service';
import { 
  LotInfoType,
  LotInfoConnection,
  LotMovementType,
  RecallInfoType,
  CreateLotInput,
  UpdateLotInput,
  CreateRecallInput,
} from '../types/lot-tracking.types';

@Resolver(() => LotInfoType)
@UseGuards(JwtAuthGuard)
export class LotTrackingResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly lotTrackingService: LotTrackingService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => LotInfoType, { name: 'lot' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getLot(
    @Args('lotNumber') lotNumber: string,
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.lotTrackingService.getLotByNumber(tenantId, productId, lotNumber);
  }

  @Query(() => LotInfoConnection, { name: 'lots' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getLots(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('warehouseId', { type: () => ID, nullable: true }) warehouseId: string,
    @Args('qualityStatus', { type: () => String, nullable: true }) qualityStatus: string,
    @Args('includeExpired', { type: () => Boolean, nullable: true }) includeExpired: boolean,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const lots = await this.lotTrackingService.getLotsForProduct(tenantId, productId, {
      warehouseId,
      qualityStatus,
      includeExpired,
      sortBy: 'expiryDate',
      sortOrder: 'asc',
    });
    
    return {
      edges: this.createEdges(lots, lot => lot.lotNumber),
      pageInfo: this.createPageInfo(
        false,
        false,
        lots[0]?.lotNumber,
        lots[lots.length - 1]?.lotNumber,
      ),
      totalCount: lots.length,
    };
  }

  @Query(() => [LotInfoType], { name: 'lotInventory' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getLotInventory(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.lotTrackingService.getLotsForProduct(tenantId, productId, {
      warehouseId,
      qualityStatus: 'approved',
      includeExpired: false,
    });
  }

  @Query(() => [LotMovementType], { name: 'lotMovementHistory' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getLotMovementHistory(
    @Args('lotNumber') lotNumber: string,
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.lotTrackingService.getLotMovementHistory(tenantId, lotNumber, productId);
  }

  @Query(() => String, { name: 'traceLot', description: 'Get complete traceability information for a lot' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async traceLot(
    @Args('lotNumber') lotNumber: string,
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    const traceability = await this.lotTrackingService.getLotTraceability(tenantId, lotNumber, productId);
    return JSON.stringify(traceability);
  }

  @Query(() => [LotInfoType], { name: 'expiringLots' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getExpiringLots(
    @Args('warehouseId', { type: () => ID }) warehouseId: string,
    @Args('daysAhead', { type: () => Number, nullable: true, defaultValue: 30 }) daysAhead: number,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    const expiringLots = await this.lotTrackingService.getExpiringLots(tenantId, warehouseId, daysAhead);
    return expiringLots.map(item => item.lot);
  }

  @Mutation(() => LotInfoType, { name: 'createLot' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createLot(
    @Args('input') input: CreateLotInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.lotTrackingService.createLot(tenantId, {
      tenantId,
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => LotInfoType, { name: 'updateLot' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async updateLot(
    @Args('lotNumber') lotNumber: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('input') input: UpdateLotInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.lotTrackingService.updateLot(tenantId, lotNumber, productId, {
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => RecallInfoType, { name: 'createRecall' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createRecall(
    @Args('input') input: CreateRecallInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.lotTrackingService.createRecall(tenantId, {
      tenantId,
      ...input,
      userId: user.id,
    });
  }

  @ResolveField(() => [LotMovementType], { name: 'movements' })
  async movements(
    @Parent() lot: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.lotTrackingService.getLotMovementHistory(tenantId, lot.lotNumber, lot.productId);
  }
}
