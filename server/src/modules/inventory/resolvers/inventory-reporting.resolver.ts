import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/current-tenant.decorator';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { InventoryReportingService } from '../services/inventory-reporting.service';
import { StockReport, ValuationReport, TurnoverReport } from '../types/inventory-report.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class InventoryReportingResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly reportingService: InventoryReportingService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => StockReport, { description: 'Get stock level report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryStockReport(
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId: string | null,
    @Args('brandId', { type: () => ID, nullable: true }) brandId: string | null,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<StockReport> {
    return this.reportingService.getStockReport(
      tenantId,
      locationId || undefined,
      categoryId || undefined,
      brandId || undefined,
    );
  }

  @Query(() => ValuationReport, { description: 'Get inventory valuation report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryValuationReport(
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @Args('valuationMethod', { type: () => String, defaultValue: 'average' }) valuationMethod: 'fifo' | 'lifo' | 'average',
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ValuationReport> {
    return this.reportingService.getValuationReport(
      tenantId,
      locationId || undefined,
      valuationMethod,
    );
  }

  @Query(() => TurnoverReport, { description: 'Get inventory turnover report' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryTurnoverReport(
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | null,
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<TurnoverReport> {
    return this.reportingService.getTurnoverReport(
      tenantId,
      locationId || undefined,
      startDate,
      endDate,
    );
  }
}
