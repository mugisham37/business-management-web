import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { InventoryAccuracyReportingService } from '../services/inventory-accuracy-reporting.service';
import { AccuracyReport, VarianceAnalysis, CountAccuracy } from '../types/accuracy-report.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class InventoryAccuracyReportingResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly accuracyReportingService: InventoryAccuracyReportingService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => AccuracyReport, { description: 'Get inventory accuracy report for location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryAccuracyReport(
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<AccuracyReport> {
    return this.accuracyReportingService.getAccuracyReport(
      tenantId || '',
      locationId,
      startDate || undefined,
      endDate || undefined,
    );
  }

  @Query(() => VarianceAnalysis, { description: 'Get variance analysis for location' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryVarianceAnalysis(
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<VarianceAnalysis> {
    return this.accuracyReportingService.getVarianceAnalysis(
      tenantId || '',
      locationId,
      startDate || undefined,
      endDate || undefined,
    );
  }

  @Query(() => CountAccuracy, { description: 'Get count accuracy metrics' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async inventoryCountAccuracy(
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<CountAccuracy> {
    return this.accuracyReportingService.getCountAccuracy(
      tenantId || '',
      locationId || undefined,
      startDate || undefined,
      endDate || undefined,
    );
  }
}
