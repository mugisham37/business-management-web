import { Resolver, Query, Mutation, Args, ResolveField, Parent, Subscription, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { TransactionService } from '../services/transaction.service';
import { POSService } from '../services/pos.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import { Transaction, TransactionConnection, TransactionItem, PaymentRecord } from '../types/transaction.types';
import { 
  CreateTransactionInput, 
  UpdateTransactionInput, 
  VoidTransactionInput, 
  RefundTransactionInput,
  TransactionQueryInput 
} from '../inputs/transaction.input';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => Transaction)
@UseGuards(JwtAuthGuard, TenantGuard)
export class TransactionResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly transactionService: TransactionService,
    private readonly posService: POSService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Transaction, { description: 'Get transaction by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:read')
  async transaction(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionService.findById(tenantId, id);
    
    return {
      ...transaction,
      status: transaction.status as any,
      paymentMethod: transaction.paymentMethod as any,
    };
  }

  @Query(() => TransactionConnection, { description: 'List transactions with filtering and pagination' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:read')
  async transactions(
    @Args() paginationArgs: PaginationArgs,
    @Args('query', { nullable: true }) query: TransactionQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<TransactionConnection> {
    const { limit, cursor, isForward } = this.parsePaginationArgs(paginationArgs);
    
    const options: any = {
      limit: limit + 1, // Fetch one extra to determine hasNextPage
      offset: 0,
    };

    if (query?.locationId) options.locationId = query.locationId;
    if (query?.status) options.status = query.status;
    if (query?.startDate) options.startDate = query.startDate;
    if (query?.endDate) options.endDate = query.endDate;

    const { transactions, total } = await this.transactionService.findTransactionsByTenant(
      tenantId,
      options
    );

    const hasNextPage = transactions.length > limit;
    const items = hasNextPage ? transactions.slice(0, limit) : transactions;

    // Map to GraphQL type with items array
    const graphqlTransactions = items.map(t => ({
      ...t,
      status: t.status as any,
      paymentMethod: t.paymentMethod as any,
      items: [], // Items will be loaded via field resolver if requested
    }));

    return {
      edges: this.createEdges(graphqlTransactions, item => item.id),
      pageInfo: this.createPageInfo(
        hasNextPage,
        false,
        graphqlTransactions[0]?.id,
        graphqlTransactions[graphqlTransactions.length - 1]?.id,
      ),
      totalCount: total,
    };
  }

  @Mutation(() => Transaction, { description: 'Create a new transaction' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:create')
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Transaction> {
    const transactionData: any = {
      customerId: input.customerId,
      locationId: input.locationId,
      items: input.items,
      paymentMethod: input.paymentMethod,
      taxAmount: input.taxAmount,
      discountAmount: input.discountAmount,
      tipAmount: input.tipAmount,
      notes: input.notes,
    };

    const result = await this.posService.processTransaction(
      tenantId,
      transactionData,
      user.id
    );

    // Emit subscription event
    await this.pubSub.publish('TRANSACTION_CREATED', {
      transactionCreated: {
        ...result,
        tenantId,
      },
    });

    return {
      ...result,
      status: result.status as any,
      paymentMethod: result.paymentMethod as any,
      version: 1,
    };
  }

  @Mutation(() => Transaction, { description: 'Update a transaction' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:update')
  async updateTransaction(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionService.updateTransaction(
      tenantId,
      id,
      input as any,
      user.id
    );

    return {
      ...transaction,
      status: transaction.status as any,
      paymentMethod: transaction.paymentMethod as any,
      items: [],
    };
  }

  @Mutation(() => Transaction, { description: 'Void a transaction' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:void')
  async voidTransaction(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: VoidTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Transaction> {
    const result = await this.posService.voidTransaction(
      tenantId,
      id,
      input.reason,
      input.notes,
      user.id
    );

    return {
      ...result,
      status: result.status as any,
      paymentMethod: result.paymentMethod as any,
      version: 1,
    };
  }

  @Mutation(() => Transaction, { description: 'Refund a transaction' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:refund')
  async refundTransaction(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: RefundTransactionInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Transaction> {
    const result = await this.posService.refundTransaction(
      tenantId,
      id,
      input.amount,
      input.reason,
      input.notes,
      user.id
    );

    return {
      ...result,
      status: result.status as any,
      paymentMethod: result.paymentMethod as any,
      version: 1,
    };
  }

  @ResolveField(() => [TransactionItem], { description: 'Transaction line items' })
  async lineItems(
    @Parent() transaction: Transaction,
    @CurrentTenant() tenantId: string,
  ): Promise<TransactionItem[]> {
    // If items are already loaded, return them
    if (transaction.items && transaction.items.length > 0) {
      return transaction.items;
    }

    // Otherwise, load the full transaction with items
    const fullTransaction = await this.transactionService.findById(tenantId, transaction.id);
    return fullTransaction.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productSku: item.productSku,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      discountAmount: item.discountAmount,
      taxAmount: item.taxAmount,
    }));
  }

  @ResolveField(() => [PaymentRecord], { description: 'Payment records for this transaction' })
  async payments(
    @Parent() transaction: Transaction,
    @CurrentTenant() tenantId: string,
  ): Promise<PaymentRecord[]> {
    // Mock implementation - in real app, this would load payment records
    return [];
  }

  @ResolveField(() => String, { nullable: true, description: 'Customer who made the transaction' })
  async customer(
    @Parent() transaction: Transaction,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    if (!transaction.customerId) return null;

    const loader = this.getDataLoader(
      'customer_by_id',
      async (ids: readonly string[]) => {
        // Mock batch loading
        return ids.map(id => ({ id, firstName: 'Jane', lastName: 'Smith' }));
      },
    );

    return loader.load(transaction.customerId);
  }

  @Subscription(() => Transaction, {
    description: 'Subscribe to transaction creation events',
    filter: (payload, variables, context) => {
      return payload.transactionCreated.tenantId === context.req.user.tenantId;
    },
  })
  transactionCreated(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('TRANSACTION_CREATED');
  }
}
