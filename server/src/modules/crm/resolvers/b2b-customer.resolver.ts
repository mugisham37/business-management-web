import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { B2BCustomerService } from '../services/b2b-customer.service';
import { CreateB2BCustomerInput, UpdateB2BCustomerInput, B2BCustomerFilterInput } from '../types/b2b-customer.input';
import { B2BCustomer, CustomerPricingRule, CustomerCreditHistory, B2BCustomerMetrics } from '../types/b2b-customer.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver(() => B2BCustomer)
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('b2b-customers')
export class B2BCustomerResolver {
  constructor(
    private readonly b2bCustomerService: B2BCustomerService,
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => B2BCustomer)
  @RequirePermission('customers:read')
  async b2bCustomer(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer> {
    return this.b2bCustomerService.findB2BCustomerById(tenantId, id) as Promise<B2BCustomer>;
  }

  @Query(() => [B2BCustomer])
  @RequirePermission('customers:read')
  async b2bCustomers(
    @Args('filter', { type: () => B2BCustomerFilterInput, nullable: true }) filter: B2BCustomerFilterInput = {},
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer[]> {
    const result = await this.b2bCustomerService.findB2BCustomers(tenantId, filter);
    return result.customers as B2BCustomer[];
  }

  @Query(() => [B2BCustomer])
  @RequirePermission('customers:read')
  async b2bCustomersByIndustry(
    @Args('industry') industry: string,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer[]> {
    const filter: B2BCustomerFilterInput = { industry };
    const result = await this.b2bCustomerService.findB2BCustomers(tenantId, filter);
    return result.customers as B2BCustomer[];
  }

  @Query(() => [B2BCustomer])
  @RequirePermission('customers:read')
  async b2bCustomersBySalesRep(
    @Args('salesRepId', { type: () => ID }) salesRepId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer[]> {
    const filter: B2BCustomerFilterInput = { salesRepId };
    const result = await this.b2bCustomerService.findB2BCustomers(tenantId, filter);
    return result.customers as B2BCustomer[];
  }

  @Query(() => [B2BCustomer])
  @RequirePermission('customers:read')
  async b2bCustomersWithExpiringContracts(
    @Args('days', { defaultValue: 30 }) days: number,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer[]> {
    const filter: B2BCustomerFilterInput = { contractExpiringWithinDays: days };
    const result = await this.b2bCustomerService.findB2BCustomers(tenantId, filter);
    return result.customers as B2BCustomer[];
  }

  @Query(() => B2BCustomerMetrics)
  @RequirePermission('customers:read')
  async b2bCustomerMetrics(
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerMetrics> {
    return this.b2bCustomerService.getB2BCustomerMetrics(tenantId);
  }

  @Mutation(() => B2BCustomer)
  @RequirePermission('customers:create')
  async createB2BCustomer(
    @Args('input') input: CreateB2BCustomerInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer> {
    // Convert enum values and handle type conversions
    const serviceInput = {
      ...input,
      paymentTerms: input.paymentTerms as string,
    } as any;
    return this.b2bCustomerService.createB2BCustomer(tenantId, serviceInput, user.id) as Promise<B2BCustomer>;
  }

  @Mutation(() => B2BCustomer)
  @RequirePermission('customers:update')
  async updateB2BCustomer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateB2BCustomerInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomer> {
    // Convert enum values and handle type conversions
    const serviceInput = {
      ...input,
      paymentTerms: input.paymentTerms as string | undefined,
    } as any;
    return this.b2bCustomerService.updateB2BCustomer(tenantId, id, serviceInput, user.id) as Promise<B2BCustomer>;
  }

  @Mutation(() => Boolean)
  @RequirePermission('customers:update')
  async updateB2BCustomerCreditLimit(
    @Args('id', { type: () => ID }) id: string,
    @Args('creditLimit') creditLimit: number,
    @Args('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.b2bCustomerService.updateCreditLimit(tenantId, id, creditLimit, reason, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @RequirePermission('customers:update')
  async updateB2BCustomerCreditStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
    @Args('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.b2bCustomerService.updateCreditStatus(tenantId, id, status, reason, user.id);
    return true;
  }

  // Field resolvers for related data
  @ResolveField(() => [CustomerPricingRule])
  async pricingRules(
    @Parent() customer: B2BCustomer,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerPricingRule[]> {
    const loader = this.dataLoaderService.getLoader<string, CustomerPricingRule[]>(
      `pricing_rules_by_customer_${tenantId}`,
      async (customerIds: readonly string[]) => {
        return this.b2bCustomerService.batchLoadPricingRules([...customerIds], tenantId);
      },
    );

    return loader.load(customer.id);
  }

  @ResolveField(() => [CustomerCreditHistory])
  async creditHistory(
    @Parent() customer: B2BCustomer,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerCreditHistory[]> {
    const loader = this.dataLoaderService.getLoader<string, CustomerCreditHistory[]>(
      `credit_history_by_customer_${tenantId}`,
      async (customerIds: readonly string[]) => {
        return this.b2bCustomerService.batchLoadCreditHistory([...customerIds], tenantId);
      },
    );

    return loader.load(customer.id);
  }

  @ResolveField(() => Object, { nullable: true })
  async currentPricing(
    @Parent() customer: B2BCustomer,
    @CurrentTenant() tenantId: string,
    @Args('productId', { type: () => ID, nullable: true }) productId?: string,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
  ): Promise<any> {
    return this.b2bCustomerService.getCustomerPricing(tenantId, customer.id, productId, categoryId);
  }

  @ResolveField(() => Number)
  async availableCredit(
    @Parent() customer: B2BCustomer,
    @CurrentTenant() tenantId: string,
  ): Promise<number> {
    return this.b2bCustomerService.getAvailableCredit(tenantId, customer.id);
  }

  @ResolveField(() => Number)
  async outstandingBalance(
    @Parent() customer: B2BCustomer,
    @CurrentTenant() tenantId: string,
  ): Promise<number> {
    return this.b2bCustomerService.getOutstandingBalance(tenantId, customer.id);
  }

  @ResolveField(() => Boolean)
  async contractExpiringSoon(
    @Parent() customer: B2BCustomer,
    @Args('days', { defaultValue: 30 }) days: number,
  ): Promise<boolean> {
    if (!customer.contractEndDate) return false;
    
    const daysUntilExpiry = Math.ceil(
      (customer.contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilExpiry <= days && daysUntilExpiry > 0;
  }

  @ResolveField(() => Number)
  async daysUntilContractExpiry(
    @Parent() customer: B2BCustomer,
  ): Promise<number> {
    if (!customer.contractEndDate) return -1;
    
    return Math.ceil(
      (customer.contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  }
}
