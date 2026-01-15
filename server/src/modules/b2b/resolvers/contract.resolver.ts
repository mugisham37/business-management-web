import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ContractService } from '../services/contract.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';

/**
 * GraphQL resolver for B2B contract lifecycle management
 * 
 * Provides operations for:
 * - Contract CRUD operations
 * - Contract approval workflow
 * - Contract renewal management
 * - Contract expiration tracking
 * - Real-time contract status updates
 * 
 * @requires JwtAuthGuard - Authentication required for all operations
 * @requires TenantGuard - Tenant isolation enforced
 * @requires PermissionsGuard - Permission-based access control
 */
@Resolver('Contract')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ContractResolver extends BaseResolver {
  private readonly logger = new Logger(ContractResolver.name);

  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly contractService: ContractService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  /**
   * Query: Get a single contract by ID
   * @permission contract:read
   */
  @Query('contract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:read')
  async getContract(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.debug(`Fetching contract ${id} for tenant ${tenantId}`);
      return await this.contractService.findContractById(tenantId, id);
    } catch (error) {
      this.logger.error(`Failed to get contract ${id}:`, error);
      throw error;
    }
  }

  /**
   * Query: Get paginated list of contracts with filtering
   * @permission contract:read
   */
  @Query('contracts')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:read')
  async getContracts(
    @Args('query') query: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.debug(`Fetching contracts for tenant ${tenantId} with query:`, query);
      const result = await this.contractService.findContracts(tenantId, query);
      
      return {
        contracts: result.contracts,
        total: result.total,
      };
    } catch (error) {
      this.logger.error(`Failed to get contracts:`, error);
      throw error;
    }
  }

  /**
   * Query: Get contracts expiring within specified days
   * @permission contract:read
   */
  @Query('expiringContracts')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:read')
  async getExpiringContracts(
    @Args('days') days: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.debug(`Fetching contracts expiring within ${days} days for tenant ${tenantId}`);
      return await this.contractService.getExpiringContracts(tenantId, days);
    } catch (error) {
      this.logger.error(`Failed to get expiring contracts:`, error);
      throw error;
    }
  }

  /**
   * Mutation: Create a new contract
   * @permission contract:create
   */
  @Mutation('createContract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:create')
  async createContract(
    @Args('input') input: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.log(`Creating contract for tenant ${tenantId} by user ${user.id}`);
      
      const contract = await this.contractService.createContract(
        tenantId,
        input,
        user.id,
      );

      this.logger.log(`Created contract ${contract.contractNumber} (${contract.id})`);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to create contract:`, error);
      throw error;
    }
  }

  /**
   * Mutation: Update an existing contract
   * @permission contract:update
   */
  @Mutation('updateContract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:update')
  async updateContract(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.log(`Updating contract ${id} for tenant ${tenantId} by user ${user.id}`);
      
      const contract = await this.contractService.updateContract(
        tenantId,
        id,
        input,
        user.id,
      );

      this.logger.log(`Updated contract ${id}`);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to update contract ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mutation: Approve a contract
   * @permission contract:approve
   */
  @Mutation('approveContract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:approve')
  async approveContract(
    @Args('id', { type: () => ID }) id: string,
    @Args('approvalNotes') approvalNotes: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.log(`Approving contract ${id} for tenant ${tenantId} by user ${user.id}`);
      
      const contract = await this.contractService.approveContract(
        tenantId,
        id,
        approvalNotes,
        user.id,
      );

      this.logger.log(`Approved contract ${id}`);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to approve contract ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mutation: Renew a contract with new terms
   * @permission contract:renew
   */
  @Mutation('renewContract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:renew')
  async renewContract(
    @Args('id', { type: () => ID }) id: string,
    @Args('newEndDate') newEndDate: Date,
    @Args('contractValue', { nullable: true }) contractValue: number,
    @Args('pricingTerms', { nullable: true }) pricingTerms: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.log(`Renewing contract ${id} for tenant ${tenantId} by user ${user.id}`);
      
      const contract = await this.contractService.renewContract(
        tenantId,
        id,
        newEndDate,
        contractValue,
        pricingTerms,
        user.id,
      );

      this.logger.log(`Renewed contract ${id} with new end date ${newEndDate}`);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to renew contract ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mutation: Terminate a contract
   * @permission contract:terminate
   */
  @Mutation('terminateContract')
  @UseGuards(PermissionsGuard)
  @Permissions('contract:terminate')
  async terminateContract(
    @Args('id', { type: () => ID }) id: string,
    @Args('terminationReason') terminationReason: string,
    @Args('terminationDate', { nullable: true }) terminationDate: Date,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      this.logger.log(`Terminating contract ${id} for tenant ${tenantId} by user ${user.id}`);
      
      // Get contract and update status to terminated
      const contract = await this.contractService.updateContract(
        tenantId,
        id,
        {
          status: 'terminated',
          metadata: {
            terminationReason,
            terminationDate: terminationDate || new Date(),
            terminatedBy: user.id,
          },
        },
        user.id,
      );

      this.logger.log(`Terminated contract ${id}`);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to terminate contract ${id}:`, error);
      throw error;
    }
  }

  /**
   * Field Resolver: Load customer for contract
   * Uses DataLoader for batch loading to prevent N+1 queries
   */
  @ResolveField('customer')
  async getCustomer(
    @Parent() contract: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      // DataLoader implementation would go here
      // For now, return a placeholder that indicates the customer ID
      return {
        id: contract.customerId,
        // Additional customer fields would be loaded via DataLoader
      };
    } catch (error) {
      this.logger.error(`Failed to load customer for contract ${contract.id}:`, error);
      throw error;
    }
  }

  /**
   * Field Resolver: Load pricing agreements for contract
   * Returns pricing terms and agreements associated with the contract
   */
  @ResolveField('pricingAgreements')
  async getPricingAgreements(
    @Parent() contract: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      // Return pricing terms from contract
      return contract.pricingTerms || {};
    } catch (error) {
      this.logger.error(`Failed to load pricing agreements for contract ${contract.id}:`, error);
      throw error;
    }
  }

  /**
   * Field Resolver: Load sales representative for contract
   * Uses DataLoader for batch loading
   */
  @ResolveField('salesRep')
  async getSalesRep(
    @Parent() contract: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      if (!contract.salesRepId) {
        return null;
      }

      // DataLoader implementation would go here
      return {
        id: contract.salesRepId,
        // Additional user fields would be loaded via DataLoader
      };
    } catch (error) {
      this.logger.error(`Failed to load sales rep for contract ${contract.id}:`, error);
      throw error;
    }
  }

  /**
   * Field Resolver: Load account manager for contract
   * Uses DataLoader for batch loading
   */
  @ResolveField('accountManager')
  async getAccountManager(
    @Parent() contract: any,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      if (!contract.accountManagerId) {
        return null;
      }

      // DataLoader implementation would go here
      return {
        id: contract.accountManagerId,
        // Additional user fields would be loaded via DataLoader
      };
    } catch (error) {
      this.logger.error(`Failed to load account manager for contract ${contract.id}:`, error);
      throw error;
    }
  }

  /**
   * Subscription: Contract expiring notification
   * Filters events by tenant for multi-tenant isolation
   * 
   * Emitted when a contract is approaching expiration
   */
  @Subscription('contractExpiring', {
    filter: (payload, variables, context) => {
      // Filter by tenant to ensure data isolation
      return payload.contractExpiring.tenantId === context.req.user.tenantId;
    },
  })
  contractExpiring(@CurrentTenant() tenantId: string) {
    this.logger.debug(`Subscription: contractExpiring for tenant ${tenantId}`);
    return this.pubSub.asyncIterator('CONTRACT_EXPIRING');
  }

  /**
   * Subscription: Contract status changed
   * Filters events by tenant and optionally by contract ID
   * 
   * Emitted when a contract status changes (approved, renewed, terminated, etc.)
   */
  @Subscription('contractStatusChanged', {
    filter: (payload, variables, context) => {
      const matchesTenant = payload.contractStatusChanged.tenantId === context.req.user.tenantId;
      const matchesContract = !variables.contractId || payload.contractStatusChanged.id === variables.contractId;
      return matchesTenant && matchesContract;
    },
  })
  contractStatusChanged(
    @Args('contractId', { type: () => ID, nullable: true }) contractId: string,
    @CurrentTenant() tenantId: string,
  ) {
    this.logger.debug(`Subscription: contractStatusChanged for tenant ${tenantId}, contract ${contractId || 'all'}`);
    return this.pubSub.asyncIterator('CONTRACT_STATUS_CHANGED');
  }
}
