import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';
import { PayrollStatus } from '../dto/payroll.dto';

// Register enum for GraphQL
registerEnumType(PayrollStatus, {
  name: 'PayrollStatus',
  description: 'Status of payroll record or period',
});

@ObjectType({ description: 'Payroll record for an employee' })
export class PayrollRecordType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field(() => ID)
  @ApiProperty()
  payrollPeriodId!: string;

  @Field(() => Float)
  @ApiProperty()
  regularHours!: number;

  @Field(() => Float)
  @ApiProperty()
  overtimeHours!: number;

  @Field(() => Float)
  @ApiProperty()
  regularRate!: number;

  @Field(() => Float)
  @ApiProperty()
  overtimeRate!: number;

  @Field(() => Float)
  @ApiProperty()
  regularPay!: number;

  @Field(() => Float)
  @ApiProperty()
  overtimePay!: number;

  @Field(() => Float)
  @ApiProperty()
  grossPay!: number;

  @Field(() => Float)
  @ApiProperty()
  totalTaxes!: number;

  @Field(() => Float)
  @ApiProperty()
  totalDeductions!: number;

  @Field(() => Float)
  @ApiProperty()
  netPay!: number;

  @Field(() => PayrollStatus)
  @ApiProperty({ enum: PayrollStatus })
  status!: PayrollStatus;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  approvedBy?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  approvedAt?: Date;
}

@ObjectType({ description: 'Paystub details' })
export class PaystubType {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  employeeName!: string;

  @Field()
  @ApiProperty()
  periodStart!: Date;

  @Field()
  @ApiProperty()
  periodEnd!: Date;

  @Field()
  @ApiProperty()
  payDate!: Date;

  @Field(() => Float)
  @ApiProperty()
  regularHours!: number;

  @Field(() => Float)
  @ApiProperty()
  overtimeHours!: number;

  @Field(() => Float)
  @ApiProperty()
  grossPay!: number;

  @Field(() => Float)
  @ApiProperty()
  federalTax!: number;

  @Field(() => Float)
  @ApiProperty()
  stateTax!: number;

  @Field(() => Float)
  @ApiProperty()
  socialSecurityTax!: number;

  @Field(() => Float)
  @ApiProperty()
  medicareTax!: number;

  @Field(() => Float)
  @ApiProperty()
  totalTaxes!: number;

  @Field(() => Float)
  @ApiProperty()
  totalDeductions!: number;

  @Field(() => Float)
  @ApiProperty()
  netPay!: number;

  @Field(() => Float)
  @ApiProperty()
  yearToDateGross!: number;

  @Field(() => Float)
  @ApiProperty()
  yearToDateNet!: number;
}

@ObjectType({ description: 'Payroll period' })
export class PayrollPeriodType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field()
  @ApiProperty()
  periodName!: string;

  @Field()
  @ApiProperty()
  startDate!: Date;

  @Field()
  @ApiProperty()
  endDate!: Date;

  @Field()
  @ApiProperty()
  payDate!: Date;

  @Field(() => PayrollStatus)
  @ApiProperty({ enum: PayrollStatus })
  status!: PayrollStatus;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  totalGrossPay?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  totalNetPay?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  totalTaxes?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  totalDeductions?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  processedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  processedBy?: string;
}

@ObjectType({ description: 'Payroll settings' })
export class PayrollSettingsType {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field(() => Float)
  @ApiProperty()
  federalTaxRate!: number;

  @Field(() => Float)
  @ApiProperty()
  stateTaxRate!: number;

  @Field(() => Float)
  @ApiProperty()
  socialSecurityRate!: number;

  @Field(() => Float)
  @ApiProperty()
  medicareRate!: number;

  @Field(() => Float)
  @ApiProperty()
  overtimeMultiplier!: number;

  @Field(() => Int)
  @ApiProperty()
  payPeriodDays!: number;

  @Field()
  @ApiProperty()
  payFrequency!: string;
}

@ObjectType({ description: 'Payroll processing job' })
export class PayrollProcessingJob {
  @Field(() => ID)
  @ApiProperty()
  jobId!: string;

  @Field(() => ID)
  @ApiProperty()
  periodId!: string;

  @Field()
  @ApiProperty()
  status!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  message?: string;

  @Field()
  @ApiProperty()
  createdAt!: Date;
}
