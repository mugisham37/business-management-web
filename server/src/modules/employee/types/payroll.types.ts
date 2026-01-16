import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';
import { PayrollStatus, CommissionStatus } from '../inputs/payroll.input';

@ObjectType({ description: 'Payroll record for an employee' })
export class PayrollRecordType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  payrollPeriodId!: string;

  @Field(() => Float)
  regularHours!: number;

  @Field(() => Float)
  overtimeHours!: number;

  @Field(() => Float)
  regularRate!: number;

  @Field(() => Float)
  overtimeRate!: number;

  @Field(() => Float)
  regularPay!: number;

  @Field(() => Float)
  overtimePay!: number;

  @Field(() => Float)
  grossPay!: number;

  @Field(() => Float)
  totalTaxes!: number;

  @Field(() => Float)
  totalDeductions!: number;

  @Field(() => Float)
  netPay!: number;

  @Field(() => PayrollStatus)
  status!: PayrollStatus;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  approvedAt?: Date;
}

@ObjectType({ description: 'Paystub details' })
export class PaystubType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  employeeName!: string;

  @Field()
  periodStart!: Date;

  @Field()
  periodEnd!: Date;

  @Field(() => Float)
  grossPay!: number;

  @Field(() => Float)
  totalDeductions!: number;

  @Field(() => Float)
  totalTaxes!: number;

  @Field(() => Float)
  netPay!: number;

  @Field(() => [TaxLineItemType])
  taxes!: TaxLineItemType[];

  @Field(() => [DeductionLineItemType])
  deductions!: DeductionLineItemType[];

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Tax line item' })
export class TaxLineItemType {
  @Field()
  name!: string;

  @Field(() => Float)
  amount!: number;

  @Field({ nullable: true })
  percentage?: number;
}

@ObjectType({ description: 'Deduction line item' })
export class DeductionLineItemType {
  @Field()
  name!: string;

  @Field(() => Float)
  amount!: number;

  @Field({ nullable: true })
  percentage?: number;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType({ description: 'Payroll period record' })
export class PayrollPeriodType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field()
  periodName!: string;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field()
  payDate!: Date;

  @Field()
  periodType!: string;

  @Field(() => PayrollStatus)
  status!: PayrollStatus;

  @Field(() => Float, { nullable: true })
  totalGrossPay?: number;

  @Field(() => Float, { nullable: true })
  totalNetPay?: number;

  @Field(() => Float, { nullable: true })
  totalTaxes?: number;

  @Field(() => Float, { nullable: true })
  totalDeductions?: number;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field(() => ID, { nullable: true })
  processedBy?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Commission record' })
export class CommissionRecordType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  transactionId?: string;

  @Field(() => Float)
  saleAmount!: number;

  @Field(() => Float)
  commissionRate!: number;

  @Field(() => Float)
  commissionAmount!: number;

  @Field()
  saleDate!: Date;

  @Field({ nullable: true })
  commissionType?: string;

  @Field({ nullable: true })
  productCategory?: string;

  @Field({ nullable: true })
  customerType?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => CommissionStatus)
  status!: CommissionStatus;

  @Field(() => ID, { nullable: true })
  payrollPeriodId?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Payroll settings' })
export class PayrollSettingsType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => Float)
  federalTaxRate!: number;

  @Field(() => Float)
  stateTaxRate!: number;

  @Field(() => Float)
  socialSecurityRate!: number;

  @Field(() => Float)
  medicareRate!: number;

  @Field(() => Float)
  overtimeMultiplier!: number;

  @Field(() => Int)
  payPeriodDays!: number;

  @Field()
  payFrequency!: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Payroll processing job' })
export class PayrollProcessingJob extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  payrollPeriodId!: string;

  @Field()
  jobStatus!: string;

  @Field(() => Int)
  totalEmployees!: number;

  @Field(() => Int)
  processedEmployees!: number;

  @Field(() => Int, { nullable: true })
  failedEmployees?: number;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  notes?: string;
}
