import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { GraphQLTenantGuard } from '../../tenant/guards/graphql-tenant.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { FinancialReportingService, FinancialReport } from '../services/financial-reporting.service';
import { GraphQLContext } from '../../../common/graphql/graphql-context.interface';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, GraphQLTenantGuard)
export class FinancialReportingResolver {
  constructor(
    private readonly financialReportingService: FinancialReportingService,
  ) {}

  @Query(() => String, { description: 'Generate balance sheet report' })
  @RequirePermission('financial:reports:read')
  async generateBalanceSheet(
    @Args('asOfDate', { nullable: true }) asOfDate: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    const reportDate = asOfDate || new Date();
    
    return this.financialReportingService.generateBalanceSheet(
      context.req.tenant.id,
      reportDate,
      context.req.user.id,
    );
  }

  @Query(() => String, { description: 'Generate income statement (P&L) report' })
  @RequirePermission('financial:reports:read')
  async generateIncomeStatement(
    @Args('periodStart') periodStart: Date,
    @Args('periodEnd') periodEnd: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    if (periodStart >= periodEnd) {
      throw new Error('Period start must be before period end');
    }

    return this.financialReportingService.generateIncomeStatement(
      context.req.tenant.id,
      periodStart,
      periodEnd,
      context.req.user.id,
    );
  }

  @Query(() => String, { description: 'Generate cash flow statement' })
  @RequirePermission('financial:reports:read')
  async generateCashFlowStatement(
    @Args('periodStart') periodStart: Date,
    @Args('periodEnd') periodEnd: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    if (periodStart >= periodEnd) {
      throw new Error('Period start must be before period end');
    }

    return this.financialReportingService.generateCashFlowStatement(
      context.req.tenant.id,
      periodStart,
      periodEnd,
      context.req.user.id,
    );
  }

  @Query(() => String, { description: 'Generate trial balance report' })
  @RequirePermission('financial:reports:read')
  async generateTrialBalance(
    @Args('asOfDate', { nullable: true }) asOfDate: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    const reportDate = asOfDate || new Date();
    
    return this.financialReportingService.generateTrialBalance(
      context.req.tenant.id,
      reportDate,
      context.req.user.id,
    );
  }

  @Query(() => String, { description: 'Generate general ledger report for specific account' })
  @RequirePermission('financial:reports:read')
  async generateGeneralLedger(
    @Args('accountId') accountId: string,
    @Args('periodStart') periodStart: Date,
    @Args('periodEnd') periodEnd: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    if (periodStart >= periodEnd) {
      throw new Error('Period start must be before period end');
    }

    return this.financialReportingService.generateGeneralLedger(
      context.req.tenant.id,
      accountId,
      periodStart,
      periodEnd,
      context.req.user.id,
    );
  }

  @Query(() => String, { description: 'Generate financial ratios analysis' })
  @RequirePermission('financial:reports:read')
  async generateFinancialRatios(
    @Args('asOfDate', { nullable: true }) asOfDate: Date,
    @Context() context: GraphQLContext,
  ): Promise<FinancialReport> {
    const reportDate = asOfDate || new Date();
    
    return this.financialReportingService.generateFinancialRatios(
      context.req.tenant.id,
      reportDate,
      context.req.user.id,
    );
  }
}