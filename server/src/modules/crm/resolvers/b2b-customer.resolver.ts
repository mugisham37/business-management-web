import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { B2BCustomerService } from '../services/b2b-customer.service';
import { CreateB2BCustomerDto, UpdateB2BCustomerDto, B2BCustomerQueryDto } from '../dto/b2b-customer.dto';
import { B2BCustomerType } from '../types/b2b-customer.types';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver(() => B2BCustomerType)
@UseGuards(JwtAuthGuard, TenantGuard)
export class B2BCustomerResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly b2bCustomerService: B2BCustomerService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => B2BCustomerType)
  @UseGuards(PermissionsGuard)
  @Permissions('customers:read')
  async b2bCustomer(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType> {
    return this.b2bCustomerService.findB2BCustomerById(tenantId, id);
  }

  @Query(() => [B2BCustomerType])
  @UseGuards(PermissionsGuard)
  @Permissions('customers:read')
  async b2bCustomers(
    @Args('query', { type: () => B2BCustomerQueryDto, nullable: true }) query: B2BCustomerQueryDto = {},
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType[]> {
    const result = await this.b2bCustomerService.findB2BCustomers(tenantId, query);
    return result.customers;
  }

  @Query(() => B2BCustomerType, { nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('customers:read')
  async getB2BCustomerHierarchy(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType> {
    // Get the customer with hierarchy information loaded
    const customer = await this.b2bCustomerService.findB2BCustomerById(tenantId, id);
    return customer;
  }

  @Mutation(() => B2BCustomerType)
  @UseGuards(PermissionsGuard)
  @Permissions('customers:create')
  async createB2BCustomer(
    @Args('input') input: CreateB2BCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType> {
    return this.b2bCustomerService.createB2BCustomer(tenantId, input, user.id);
  }

  @Mutation(() => B2BCustomerType)
  @UseGuards(PermissionsGuard)
  @Permissions('customers:update')
  async updateB2BCustomer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateB2BCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType> {
    return this.b2bCustomerService.updateB2BCustomer(tenantId, id, input, user.id);
  }

  @ResolveField(() => B2BCustomerType, { nullable: true })
  async parentCustomer(
    @Parent() customer: B2BCustomerType,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType | null> {
    // B2B customers can have parent-child relationships for corporate hierarchies
    // This would require a parentCustomerId field in the schema
    // For now, return null as the schema doesn't have this field yet
    return null;
  }

  @ResolveField(() => [B2BCustomerType])
  async childCustomers(
    @Parent() customer: B2BCustomerType,
    @CurrentTenant() tenantId: string,
  ): Promise<B2BCustomerType[]> {
    // Load child customers using DataLoader for batch loading
    const loader = this.getDataLoader<string, B2BCustomerType[]>(
      `b2b_customers_by_parent_${tenantId}`,
      async (parentIds: readonly string[]) => {
        // This would query for customers where parentCustomerId IN (parentIds)
        // For now, return empty arrays as the schema doesn't have this field yet
        return parentIds.map(() => []);
      },
    );

    return loader.load(customer.id);
  }

  @ResolveField(() => [Object])
  async contracts(
    @Parent() customer: B2BCustomerType,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    // Load contracts using DataLoader for batch loading
    const loader = this.getDataLoader<string, any[]>(
      `contracts_by_customer_${tenantId}`,
      async (customerIds: readonly string[]) => {
        // This would query the contracts table
        // For now, return empty arrays as contracts are in the B2B module
        return customerIds.map(() => []);
      },
    );

    return loader.load(customer.id);
  }

  @ResolveField(() => [Object])
  async orders(
    @Parent() customer: B2BCustomerType,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    // Load orders using DataLoader for batch loading
    const loader = this.getDataLoader<string, any[]>(
      `orders_by_customer_${tenantId}`,
      async (customerIds: readonly string[]) => {
        // This would query the orders table
        // For now, return empty arrays as orders are in the B2B module
        return customerIds.map(() => []);
      },
    );

    return loader.load(customer.id);
  }
}
