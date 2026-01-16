import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  IsDecimal,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums for GraphQL
export enum PayrollPeriodType {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  SEMI_MONTHLY = 'semi_monthly',
  MONTHLY = 'monthly',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  PAID = 'paid',
}

export enum CommissionType {
  SALES = 'sales',
  REFERRAL = 'referral',
  BONUS = 'bonus',
}

export enum CommissionStatus {
  PENDING = 'pending',
  CALCULATED = 'calculated',
  PAID = 'paid',
}

// Register enums for GraphQL
registerEnumType(PayrollPeriodType, {
  name: 'PayrollPeriodType',
  description: 'Type of payroll period',
});

registerEnumType(PayrollStatus, {
  name: 'PayrollStatus',
  description: 'Status of payroll record or period',
});

registerEnumType(CommissionType, {
  name: 'CommissionType',
  description: 'Type of commission',
});

registerEnumType(CommissionStatus, {
  name: 'CommissionStatus',
  description: 'Status of commission record',
});

// Payroll Period Input
@InputType({ description: 'Input for creating payroll period' })
export class CreatePayrollPeriodInput {
  @Field()
  @IsString()
  @Length(1, 100)
  periodName!: string;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field()
  @IsDateString()
  payDate!: string;

  @Field(() => PayrollPeriodType)
  @IsEnum(PayrollPeriodType)
  periodType!: PayrollPeriodType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating payroll period' })
export class UpdatePayrollPeriodInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  periodName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  payDate?: string;

  @Field(() => PayrollPeriodType, { nullable: true })
  @IsOptional()
  @IsEnum(PayrollPeriodType)
  periodType?: PayrollPeriodType;

  @Field(() => PayrollStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalGrossPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalNetPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalTaxes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalDeductions?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  processedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Payroll Calculation Input
@InputType({ description: 'Input for payroll calculation' })
export class PayrollCalculationInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID)
  @IsUUID()
  payrollPeriodId!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  regularHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  overtimeHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  holidayHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  sickHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  vacationHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  regularRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  overtimeRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  holidayRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  grossPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  federalTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  stateTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  localTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  socialSecurityTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  medicareTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  unemploymentTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalTaxes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  healthInsurance?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  dentalInsurance?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  visionInsurance?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  retirement401k?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  otherDeductions?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalDeductions?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  netPay?: number;

  @Field(() => PayrollStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  regularPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  overtimePay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  holidayPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  commissionPay?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  bonusPay?: number;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  commissionDetails?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  bonusDetails?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  taxDetails?: Record<string, any>;
}

// Commission Record Input
@InputType({ description: 'Input for creating commission record' })
export class CreateCommissionRecordInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  transactionId?: string;

  @Field(() => Float)
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  saleAmount!: number;

  @Field(() => Float)
  @IsDecimal({ decimal_digits: '4' })
  @Transform(({ value }) => parseFloat(value))
  commissionRate!: number;

  @Field()
  @IsDateString()
  saleDate!: string;

  @Field(() => CommissionType, { nullable: true })
  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating commission record' })
export class UpdateCommissionRecordInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  saleAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '4' })
  @Transform(({ value }) => parseFloat(value))
  commissionRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @Field(() => CommissionType, { nullable: true })
  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  commissionAmount?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @Field(() => CommissionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Query Inputs
@InputType({ description: 'Input for querying payroll records' })
export class PayrollQueryInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  periodType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType({ description: 'Input for processing payroll' })
export class ProcessPayrollInput {
  @Field(() => ID)
  @IsUUID()
  periodId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating payroll settings' })
export class UpdatePayrollSettingsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  federalTaxRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  stateTaxRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  socialSecurityRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  medicareRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  overtimeMultiplier?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  payPeriodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  payFrequency?: string;
}

@InputType({ description: 'Input for querying payroll periods' })
export class PayrollReportQueryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => PayrollPeriodType, { nullable: true })
  @IsOptional()
  @IsEnum(PayrollPeriodType)
  periodType?: PayrollPeriodType;

  @Field(() => PayrollStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDate';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

@InputType({ description: 'Input for querying commissions' })
export class CommissionQueryInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => CommissionType, { nullable: true })
  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @Field(() => CommissionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  payrollPeriodId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

@InputType({ description: 'Input for calculating payroll' })
export class CalculatePayrollInput {
  @Field(() => ID)
  @IsUUID()
  payrollPeriodId!: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  employeeIds?: string[];
}

@InputType({ description: 'Input for approving payroll' })
export class ApprovePayrollInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
