import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReconciliationService } from '../services/reconciliation.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { QueueService } from '../../queue/queue.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

/**
 * GraphQL resolver for Reconciliation operations
 * Handles bank reconciliation workflows, transaction matching, and auto-reconciliation
 */
@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('financial-management')
export class ReconciliationResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly reconciliationService: ReconciliationService,
    private readonly queueService: QueueService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Query: Get reconciliation by ID
   * Returns a single reconciliation with its details
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async reconciliation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return await this.reconciliationService.findReconciliationById(tenantId, id);
  }

  /**
   * Query: Get reconciliations by account
   * Returns list of reconciliations for an account
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async reconciliations(
    @Args('accountId', { type: () => ID }) accountId: string,
    @CurrentTenant() tenantId: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<any[]> {
    return await this.reconciliationService.findReconciliationsByAccount(
      tenantId,
      accountId,
      {
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(status && { status }),
        ...(limit && { limit }),
      },
    );
  }

  /**
   * Query: Get reconciliation items
   * Returns transactions and items for a reconciliation
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async reconciliationItems(
    @Args('reconciliationId', { type: () => ID }) reconciliationId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return await this.reconciliationService.getReconciliationItems(
      tenantId,
      reconciliationId,
    );
  }

  /**
   * Mutation: Start reconciliation
   * Initiates a new reconciliation for an account
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async startReconciliation(
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.reconciliationService.createReconciliation(
      tenantId,
      {
        accountId: input.accountId,
        reconciliationDate: new Date(input.reconciliationDate),
        statementDate: new Date(input.statementDate),
        statementBalance: input.statementBalance,
        notes: input.notes,
        attachments: input.attachments,
      },
      user.id,
    );
  }

  /**
   * Mutation: Match transaction
   * Marks a transaction as matched in the reconciliation
   */
  @Mutation(() => Boolean)
  @RequirePermission('financial:manage')
  async matchTransaction(
    @Args('reconciliationId', { type: () => ID }) reconciliationId: string,
    @Args('transactionId', { type: () => ID }) transactionId: string,
    @Args('matched') matched: boolean,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    // In a real implementation, this would update the transaction's reconciliation status
    // For now, just log the action
    console.log(`Transaction ${transactionId} ${matched ? 'matched' : 'unmatched'} in reconciliation ${reconciliationId}`);
    return true;
  }

  /**
   * Mutation: Complete reconciliation
   * Finalizes a reconciliation and marks it as complete
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async completeReconciliation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.reconciliationService.markAsReconciled(tenantId, id, user.id);
  }

  /**
   * Mutation: Auto-reconcile account
   * Enqueues automatic reconciliation job for an account
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async autoReconcile(
    @Args('accountId', { type: () => ID }) accountId: string,
    @Args('reconciliationDate') reconciliationDate: Date,
    @Args('statementBalance') statementBalance: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    // Enqueue auto-matching job to Bull queue
    const job = await this.queueService.add('financial-reconciliation', {
      tenantId,
      accountId,
      reconciliationDate: new Date(reconciliationDate),
      statementBalance,
      userId: user.id,
      operation: 'auto-reconcile',
    });

    // Return job ID for tracking
    return {
      jobId: job.id,
      status: 'queued',
      message: 'Auto-reconciliation job has been queued',
      estimatedCompletionTime: new Date(Date.now() + 60000), // 1 minute estimate
    };
  }

  /**
   * Mutation: Update reconciliation
   * Updates reconciliation details
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async updateReconciliation(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.reconciliationService.updateReconciliation(
      tenantId,
      id,
      {
        ...(input.reconciliationDate && { reconciliationDate: new Date(input.reconciliationDate) }),
        ...(input.statementDate && { statementDate: new Date(input.statementDate) }),
        ...(input.statementBalance && { statementBalance: input.statementBalance }),
        ...(input.notes && { notes: input.notes }),
        ...(input.attachments && { attachments: input.attachments }),
      },
      user.id,
    );
  }

  /**
   * Mutation: Delete reconciliation
   * Deletes a reconciliation (only if not reconciled)
   */
  @Mutation(() => Boolean)
  @RequirePermission('financial:manage')
  async deleteReconciliation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.reconciliationService.deleteReconciliation(tenantId, id, user.id);
    return true;
  }
}
