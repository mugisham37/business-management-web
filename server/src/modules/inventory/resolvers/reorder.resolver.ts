import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { ReorderService, ReorderSuggestion, ForecastData } from '../services/reorder.service';
import { 
  ReorderSuggestionResult, 
  ForecastDataResult,
  PurchaseOrderSuggestionResult,
  ReorderAnalyticsResult,
  ReorderPriority,
  TrendType
} from '../types/reorder.types';

// Mapping functions
function mapReorderSuggestion(suggestion: ReorderSuggestion): ReorderSuggestionResult {
  const mapped: ReorderSuggestionResult = {
    productId: suggestion.productId,
    locationId: suggestion.locationId,
    currentLevel: suggestion.currentLevel,
    reorderPoint: suggestion.reorderPoint,
    reorderQuantity: suggestion.reorderQuantity,
    suggestedQuantity: suggestion.suggestedQuantity,
    priority: suggestion.priority as ReorderPriority,
  };

  if (suggestion.variantId) {
    mapped.variantId = suggestion.variantId;
  }

  if (suggestion.unitCost !== undefined) {
    mapped.unitCost = suggestion.unitCost;
  }

  if (suggestion.totalCost !== undefined) {
    mapped.totalCost = suggestion.totalCost;
  }

  if (suggestion.daysUntilStockout !== undefined) {
    mapped.daysUntilStockout = suggestion.daysUntilStockout;
  }

  if (suggestion.averageDailySales !== undefined) {
    mapped.averageDailySales = suggestion.averageDailySales;
  }

  if (suggestion.leadTimeDays !== undefined) {
    mapped.leadTimeDays = suggestion.leadTimeDays;
  }

  return mapped;
}

function mapForecastData(forecast: ForecastData): ForecastDataResult {
  const mapped: ForecastDataResult = {
    productId: forecast.productId,
    locationId: forecast.locationId,
    averageDailySales: forecast.averageDailySales,
    trend: forecast.trend as TrendType,
    seasonalFactor: forecast.seasonalFactor,
    forecastedDemand: forecast.forecastedDemand,
    confidence: forecast.confidence,
  };

  if (forecast.variantId) {
    mapped.variantId = forecast.variantId;
  }

  return mapped;
}

@Resolver(() => ReorderSuggestionResult)
@UseGuards(JwtAuthGuard)
export class ReorderResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly reorderService: ReorderService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [ReorderSuggestionResult], { description: 'Get reorder suggestions' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async reorderSuggestions(
    @CurrentTenant() tenantId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
  ): Promise<ReorderSuggestionResult[]> {
    const suggestions = await this.reorderService.generateReorderSuggestions(tenantId, locationId);
    return suggestions.map(mapReorderSuggestion);
  }

  @Query(() => [ForecastDataResult], { description: 'Get demand forecast' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async demandForecast(
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentTenant() tenantId: string,
    @Args('variantId', { type: () => ID, nullable: true }) variantId?: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
  ): Promise<ForecastDataResult[]> {
    const forecasts = await this.reorderService.getForecastData(
      tenantId,
      productId,
      variantId,
      locationId,
    );
    return forecasts.map(mapForecastData);
  }

  @Query(() => PurchaseOrderSuggestionResult, { description: 'Generate purchase order suggestions' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async purchaseOrderSuggestions(
    @CurrentTenant() tenantId: string,
    @Args('supplierId', { type: () => ID, nullable: true }) supplierId?: string,
  ): Promise<PurchaseOrderSuggestionResult> {
    const suggestions = await this.reorderService.generatePurchaseOrderSuggestions(
      tenantId,
      supplierId,
    );
    
    // Convert the service response to match GraphQL type
    return {
      supplierSuggestions: Object.entries(suggestions).map(([supplierId, items]) => ({
        supplierId,
        suggestions: items.map(mapReorderSuggestion),
        totalValue: items.reduce((sum, item) => sum + (item.totalCost || 0), 0),
        itemCount: items.length,
      })),
      totalSuggestions: Object.values(suggestions).flat().length,
      totalValue: Object.values(suggestions).flat().reduce((sum, item) => sum + (item.totalCost || 0), 0),
    };
  }

  @Query(() => ReorderAnalyticsResult, { description: 'Get reorder analytics' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:read')
  async reorderAnalytics(
    @CurrentTenant() tenantId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
    @Args('periodDays', { type: () => Int, defaultValue: 30 }) periodDays?: number,
  ): Promise<ReorderAnalyticsResult> {
    const suggestions = await this.reorderService.generateReorderSuggestions(tenantId, locationId);
    
    // Calculate analytics from suggestions
    const highPriority = suggestions.filter(s => s.priority === 'high').length;
    const mediumPriority = suggestions.filter(s => s.priority === 'medium').length;
    const lowPriority = suggestions.filter(s => s.priority === 'low').length;
    
    const totalValue = suggestions.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    const averageLeadTime = suggestions.length > 0 
      ? suggestions.reduce((sum, s) => sum + (s.leadTimeDays || 0), 0) / suggestions.length 
      : 0;

    return {
      totalSuggestions: suggestions.length,
      priorityBreakdown: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      totalValue,
      averageLeadTime,
      stockoutRisk: suggestions.filter(s => (s.daysUntilStockout || 0) <= 7).length,
      period: {
        days: periodDays || 30,
        startDate: new Date(Date.now() - (periodDays || 30) * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
    };
  }

  @Mutation(() => Boolean, { description: 'Process automatic reorders' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:create')
  async processAutomaticReorders(
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.reorderService.processAutomaticReorders(tenantId);
    return true;
  }

  @Mutation(() => Boolean, { description: 'Update reorder points' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('inventory:update')
  async updateReorderPoints(
    @CurrentTenant() tenantId: string,
    @Args('locationId', { type: () => ID, nullable: true }) locationId?: string,
  ): Promise<boolean> {
    await this.reorderService.updateReorderPoints(tenantId, locationId);
    return true;
  }
}