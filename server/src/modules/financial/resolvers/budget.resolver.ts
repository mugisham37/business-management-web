import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BudgetService } from '../services/budget.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { FeatureGuard } from '../../tenant/guards/feature.guard';
import { RequireFeature } from '../../tenant/decorators/tenant.decorators';
import { RequirePermission } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

/**
 * GraphQL resolver for Budget Management operations
 * Handles budget CRUD, variance analysis, and approval workflows
 */
@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@RequireFeature('financial-management')
export class BudgetResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly budgetService: BudgetService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Query: Get budget by ID
   * Returns a single budget with its details
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async budget(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return await this.budgetService.findBudgetById(tenantId, id);
  }

  /**
   * Query: Get all budgets
   * Returns list of budgets with optional filtering
   */
  @Query(() => [String])
  @RequirePermission('financial:read')
  async budgets(
    @CurrentTenant() tenantId: string,
    @Args('fiscalYear', { nullable: true }) fiscalYear?: number,
    @Args('status', { nullable: true }) status?: string,
    @Args('budgetType', { nullable: true }) budgetType?: string,
  ): Promise<any[]> {
    return await this.budgetService.findAllBudgets(tenantId, {
      ...(fiscalYear !== undefined && { fiscalYear }),
      ...(status !== undefined && { status }),
      ...(budgetType !== undefined && { budgetType }),
    });
  }

  /**
   * Query: Get budget variance analysis
   * Returns variance analysis comparing budget to actual spending
   */
  @Query(() => String)
  @RequirePermission('financial:read')
  async getBudgetVariance(
    @Args('budgetId', { type: () => ID }) budgetId: string,
    @CurrentTenant() tenantId: string,
    @Args('asOfDate', { nullable: true }) asOfDate?: Date,
  ): Promise<any> {
    return await this.budgetService.getBudgetVarianceAnalysis(
      tenantId,
      budgetId,
      asOfDate,
    );
  }

  /**
   * Mutation: Create budget
   * Creates a new budget for a fiscal period
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async createBudget(
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.budgetService.createBudget(
      tenantId,
      {
        budgetName: input.budgetName,
        budgetType: input.budgetType,
        fiscalYear: input.fiscalYear,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        description: input.description,
        notes: input.notes,
      },
      user.id,
    );
  }

  /**
   * Mutation: Update budget
   * Updates an existing budget (only if not approved/active)
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async updateBudget(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.budgetService.updateBudget(
      tenantId,
      id,
      {
        budgetName: input.budgetName,
        description: input.description,
        notes: input.notes,
      },
      user.id,
    );
  }

  /**
   * Mutation: Approve budget
   * Approves a draft budget for activation
   */
  @Mutation(() => String)
  @RequirePermission('financial:approve')
  async approveBudget(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.budgetService.approveBudget(tenantId, id, user.id);
  }

  /**
   * Mutation: Delete budget
   * Deletes a budget (only if not active)
   */
  @Mutation(() => Boolean)
  @RequirePermission('financial:manage')
  async deleteBudget(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.budgetService.deleteBudget(tenantId, id, user.id);
    return true;
  }

  /**
   * Mutation: Add budget line
   * Adds a line item to a budget
   */
  @Mutation(() => String)
  @RequirePermission('financial:manage')
  async addBudgetLine(
    @Args('budgetId', { type: () => ID }) budgetId: string,
    @Args('input') input: any,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.budgetService.addBudgetLine(
      tenantId,
      budgetId,
      {
        accountId: input.accountId,
        annualAmount: input.annualAmount,
        q1Amount: input.q1Amount,
        q2Amount: input.q2Amount,
        q3Amount: input.q3Amount,
        q4Amount: input.q4Amount,
        monthlyAmounts: input.monthlyAmounts,
        departmentId: input.departmentId,
        projectId: input.projectId,
        locationId: input.locationId,
        notes: input.notes,
      },
      user.id,
    );
  }

  /**
   * Field Resolver: Get actual spending for budget
   * Calculates actual spending against budget
   */
  @ResolveField(() => String)
  async actualSpending(
    @Parent() budget: any,
  ): Promise<number> {
    // In a real implementation, this would calculate actual spending from transactions
    // For now, return 0
    return 0;
  }

  /**
   * Field Resolver: Get variance for budget
   * Calculates variance between budget and actual
   */
  @ResolveField(() => String)
  async variance(
    @Parent() budget: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // Get variance analysis
    const analysis = await this.budgetService.getBudgetVarianceAnalysis(
      tenantId,
      budget.id,
    );

    return {
      totalVariance: analysis.summary.totalVariance,
      favorableVariances: analysis.summary.favorableVariances,
      unfavorableVariances: analysis.summary.unfavorableVariances,
      percentComplete: analysis.percentComplete,
    };
  }
}
