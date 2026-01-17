import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { InventoryReportingService } from '../services/inventory-reporting.service';
import { ProductService } from '../services/product.service';
import { 
  StockLevelReport, 
  MovementReport, 
  AgingReport, 
  TurnoverReport 
} from '../types/inventory-reporting.types';
import { 
  StockLevelReportInput, 
  MovementReportInput, 
  AgingReportInput, 
  TurnoverReportInput 
} from '../inputs/inventory-reporting.input';

@Resolver()
@UseGuards(JwtAuthGuard)
export class InventoryReportingResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly reportingService: InventoryReportingService,
    private readonly productService: ProductService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => StockLevelReport, { description: 'Generate stock level report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async stockLevelReport(
    @Args('input', { type: () => StockLevelReportInput, nullable: true }) input: StockLevelReportInput | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<StockLevelReport> {
    return this.reportingService.generateStockLevelReport(tenantId, input || {});
  }

  @Query(() => MovementReport, { description: 'Generate movement report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async movementReport(
    @Args('input', { type: () => MovementReportInput, nullable: true }) input: MovementReportInput | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<MovementReport> {
    return this.reportingService.generateMovementReport(tenantId, input || {});
  }

  @Query(() => AgingReport, { description: 'Generate aging report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async agingReport(
    @Args('input', { type: () => AgingReportInput, nullable: true }) input: AgingReportInput | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<AgingReport> {
    return this.reportingService.generateAgingReport(tenantId, input || {});
  }

  @Query(() => TurnoverReport, { description: 'Generate turnover report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async turnoverReport(
    @Args('input', { type: () => TurnoverReportInput, nullable: true }) input: TurnoverReportInput | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<TurnoverReport> {
    return this.reportingService.generateTurnoverReport(tenantId, input || {});
  }
}
