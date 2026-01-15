import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MultiCurrencyService, Currency, ExchangeRate, ConversionResult } from '../services/multi-currency.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

/**
 * GraphQL resolver for Multi-Currency operations
 * Handles currency conversion, exchange rates, and multi-currency reporting
 */
@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('financial-management')
export class MultiCurrencyResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly multiCurrencyService: MultiCurrencyService,
    private readonly cacheService: IntelligentCacheService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Query: Convert currency
   * Converts an amount from one currency to another
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async convertCurrency(
    @Args('amount') amount: number,
    @Args('fromCurrencyId', { type: () => ID }) fromCurrencyId: string,
    @Args('toCurrencyId', { type: () => ID }) toCurrencyId: string,
    @CurrentTenant() tenantId: string,
    @Args('conversionDate', { nullable: true }) conversionDate?: Date,
  ): Promise<ConversionResult> {
    // Check cache first (1-hour TTL)
    const cacheKey = `currency:conversion:${tenantId}:${fromCurrencyId}:${toCurrencyId}:${amount}:${conversionDate?.toISOString() || 'now'}`;
    let result = await this.cacheService.get<ConversionResult>(cacheKey);

    if (!result) {
      result = await this.multiCurrencyService.convertAmount(
        tenantId,
        amount,
        fromCurrencyId,
        toCurrencyId,
        conversionDate || new Date(),
      );

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, result, { ttl: 3600 });
    }

    return result;
  }

  /**
   * Query: Get exchange rates
   * Returns all exchange rates with optional filtering
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async getExchangeRates(
    @CurrentTenant() tenantId: string,
    @Args('fromCurrencyId', { type: () => ID, nullable: true }) fromCurrencyId?: string,
    @Args('toCurrencyId', { type: () => ID, nullable: true }) toCurrencyId?: string,
    @Args('effectiveDate', { nullable: true }) effectiveDate?: Date,
  ): Promise<ExchangeRate[]> {
    // Check cache first (1-hour TTL)
    const cacheKey = `currency:rates:${tenantId}:${fromCurrencyId || 'all'}:${toCurrencyId || 'all'}:${effectiveDate?.toISOString() || 'now'}`;
    let rates = await this.cacheService.get<ExchangeRate[]>(cacheKey);

    if (!rates) {
      if (fromCurrencyId && toCurrencyId) {
        const rate = await this.multiCurrencyService.getExchangeRate(
          tenantId,
          fromCurrencyId,
          toCurrencyId,
          effectiveDate || new Date(),
        );
        rates = rate ? [rate] : [];
      } else {
        // Get all currencies and their rates
        const currencies = await this.multiCurrencyService.getCurrencies(tenantId, true);
        rates = [];
        
        // For now, return empty array - in real implementation would fetch all rates
        // This would require a method to get all exchange rates
      }

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, rates, { ttl: 3600 });
    }

    return rates;
  }

  /**
   * Query: Get multi-currency report
   * Returns financial data in multiple currencies
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async getMultiCurrencyReport(
    @CurrentTenant() tenantId: string,
    @Args('reportType') reportType: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Args('targetCurrencyId', { type: () => ID, nullable: true }) targetCurrencyId?: string,
  ): Promise<any> {
    // Check cache first (1-hour TTL)
    const cacheKey = `currency:report:${tenantId}:${reportType}:${dateFrom?.toISOString() || 'start'}:${dateTo?.toISOString() || 'end'}:${targetCurrencyId || 'base'}`;
    let report = await this.cacheService.get<any>(cacheKey);

    if (!report) {
      // Get base currency if target not specified
      const targetCurrency = targetCurrencyId 
        ? await this.multiCurrencyService.getCurrencies(tenantId, true).then(currencies => 
            currencies.find(c => c.id === targetCurrencyId)
          )
        : await this.multiCurrencyService.getBaseCurrency(tenantId);

      if (!targetCurrency) {
        throw new Error('Target currency not found');
      }

      // In a real implementation, this would generate a comprehensive multi-currency report
      // For now, return a placeholder structure
      report = {
        reportType,
        dateFrom,
        dateTo,
        targetCurrency,
        summary: {
          totalRevenue: 0,
          totalExpenses: 0,
          netIncome: 0,
          unrealizedGains: 0,
          unrealizedLosses: 0,
        },
        byCurrency: [],
        generatedAt: new Date(),
      };

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, report, { ttl: 3600 });
    }

    return report;
  }

  /**
   * Query: Get currencies
   * Returns list of available currencies
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async currencies(
    @CurrentTenant() tenantId: string,
    @Args('activeOnly', { nullable: true }) activeOnly?: boolean,
  ): Promise<Currency[]> {
    return await this.multiCurrencyService.getCurrencies(tenantId, activeOnly ?? true);
  }

  /**
   * Mutation: Update exchange rate
   * Creates or updates an exchange rate
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async updateExchangeRate(
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ExchangeRate> {
    const exchangeRate = await this.multiCurrencyService.createExchangeRate(tenantId, {
      fromCurrencyId: input.fromCurrencyId,
      toCurrencyId: input.toCurrencyId,
      exchangeRate: parseFloat(input.exchangeRate),
      effectiveDate: new Date(input.effectiveDate),
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
      rateSource: input.rateSource || 'manual',
      rateProvider: input.rateProvider,
      notes: input.notes,
    } as any);

    // Invalidate cache
    await this.cacheService.invalidatePattern(`currency:*:${tenantId}:*`);

    return exchangeRate;
  }

  /**
   * Mutation: Create currency
   * Adds a new currency to the system
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async createCurrency(
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Currency> {
    const currency = await this.multiCurrencyService.createCurrency(tenantId, {
      currencyCode: input.currencyCode,
      currencyName: input.currencyName,
      currencySymbol: input.currencySymbol,
      decimalPlaces: input.decimalPlaces || 2,
      decimalSeparator: input.decimalSeparator || '.',
      thousandsSeparator: input.thousandsSeparator || ',',
      symbolPosition: input.symbolPosition || 'before',
      isActive: input.isActive ?? true,
      isBaseCurrency: input.isBaseCurrency || false,
      countryCode: input.countryCode,
      notes: input.notes,
    });

    // Invalidate cache
    await this.cacheService.invalidatePattern(`currency:*:${tenantId}:*`);

    return currency;
  }
}
