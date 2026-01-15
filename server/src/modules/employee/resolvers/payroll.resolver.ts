import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PayrollService } from '../services/payroll.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  PayrollRecordType,
  PaystubType,
  PayrollSettingsType,
  PayrollProcessingJob,
} from '../types/payroll.types';
import {
  PayrollQueryInput,
  ProcessPayrollInput,
  UpdatePayrollSettingsInput,
} from '../inputs/payroll.input';

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
export class PayrollResolver extends BaseResolver {
  private readonly logger = new Logger(PayrollResolver.name);

  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly payrollService: PayrollService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [PayrollRecordType], { description: 'Get payroll records with filtering' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('payroll:read')
  async getPayroll(
    @Args('query', { nullable: true }) query: PayrollQueryInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PayrollRecordType[]> {
    // Audit log for payroll access
    this.logger.log({
      action: 'payroll.access',
      userId: user.id,
      tenantId,
      query,
      timestamp: new Date().toISOString(),
    });

    const result = await this.payrollService.findCommissionRecords(tenantId, query || {});
    
    // Map commission records to payroll records (simplified)
    // In production, this would fetch actual payroll records
    return result.commissions.map(commission => ({
      id: commission.id,
      tenantId,
      employeeId: commission.employeeId,
      payrollPeriodId: commission.payrollPeriodId || '',
      regularHours: 0,
      overtimeHours: 0,
      regularRate: 0,
      overtimeRate: 0,
      regularPay: 0,
      overtimePay: 0,
      grossPay: commission.commissionAmount,
      totalTaxes: 0,
      totalDeductions: 0,
      netPay: commission.commissionAmount,
      status: commission.status as any,
      version: 1,
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
    }));
  }

  @Query(() => PaystubType, { description: 'Get employee paystub' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('payroll:read')
  async getPaystub(
    @Args('employeeId') employeeId: string,
    @Args('periodId') periodId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PaystubType> {
    // Audit log for paystub access
    this.logger.log({
      action: 'paystub.access',
      userId: user.id,
      tenantId,
      employeeId,
      periodId,
      timestamp: new Date().toISOString(),
    });

    // Get payroll period
    const period = await this.payrollService.findPayrollPeriodById(tenantId, periodId);

    // Get payroll summary for the period
    const summary = await this.payrollService.getPayrollSummary(tenantId, periodId);

    // Mock paystub data - in production, fetch actual payroll record
    const paystub: PaystubType = {
      id: `paystub-${periodId}-${employeeId}`,
      employeeId,
      employeeName: 'Employee Name', // Would be fetched from employee service
      periodStart: new Date(period.startDate),
      periodEnd: new Date(period.endDate),
      payDate: new Date(period.payDate),
      regularHours: 80,
      overtimeHours: 5,
      grossPay: 2500,
      federalTax: 300,
      stateTax: 125,
      socialSecurityTax: 155,
      medicareTax: 36.25,
      totalTaxes: 616.25,
      totalDeductions: 200,
      netPay: 1683.75,
      yearToDateGross: 30000,
      yearToDateNet: 20000,
    };

    return paystub;
  }

  @Mutation(() => PayrollProcessingJob, { description: 'Process payroll for a period (enqueues to Bull queue)' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('payroll:process')
  async processPayroll(
    @Args('input') input: ProcessPayrollInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PayrollProcessingJob> {
    // Audit log for payroll processing
    this.logger.log({
      action: 'payroll.process.initiated',
      userId: user.id,
      tenantId,
      periodId: input.periodId,
      timestamp: new Date().toISOString(),
    });

    try {
      // Calculate payroll (in production, this would enqueue to Bull queue)
      await this.payrollService.calculatePayroll(tenantId, input.periodId, user.id);

      // Return job tracking information
      const job: PayrollProcessingJob = {
        jobId: `job-${Date.now()}`,
        periodId: input.periodId,
        status: 'processing',
        message: 'Payroll processing has been queued',
        createdAt: new Date(),
      };

      // Audit log for successful enqueue
      this.logger.log({
        action: 'payroll.process.enqueued',
        userId: user.id,
        tenantId,
        periodId: input.periodId,
        jobId: job.jobId,
        timestamp: new Date().toISOString(),
      });

      return job;
    } catch (error: any) {
      // Audit log for failure
      this.logger.error({
        action: 'payroll.process.failed',
        userId: user.id,
        tenantId,
        periodId: input.periodId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  @Mutation(() => PayrollSettingsType, { description: 'Update payroll settings' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('payroll:admin')
  async updatePayrollSettings(
    @Args('input') input: UpdatePayrollSettingsInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PayrollSettingsType> {
    // Audit log for settings update
    this.logger.log({
      action: 'payroll.settings.update',
      userId: user.id,
      tenantId,
      changes: input,
      timestamp: new Date().toISOString(),
    });

    // Mock implementation - in production, update settings in database
    const settings: PayrollSettingsType = {
      id: `settings-${tenantId}`,
      federalTaxRate: input.federalTaxRate ?? 0.12,
      stateTaxRate: input.stateTaxRate ?? 0.05,
      socialSecurityRate: input.socialSecurityRate ?? 0.062,
      medicareRate: input.medicareRate ?? 0.0145,
      overtimeMultiplier: input.overtimeMultiplier ?? 1.5,
      payPeriodDays: input.payPeriodDays ?? 14,
      payFrequency: input.payFrequency ?? 'biweekly',
    };

    // Audit log for successful update
    this.logger.log({
      action: 'payroll.settings.updated',
      userId: user.id,
      tenantId,
      settings,
      timestamp: new Date().toISOString(),
    });

    return settings;
  }
}
