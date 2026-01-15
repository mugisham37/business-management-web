import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, Min, Max } from 'class-validator';

@InputType({ description: 'Input for querying payroll records' })
export class PayrollQueryInput {
  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType({ description: 'Input for processing payroll' })
export class ProcessPayrollInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating payroll settings' })
export class UpdatePayrollSettingsInput {
  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  federalTaxRate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  stateTaxRate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  socialSecurityRate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  medicareRate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  overtimeMultiplier?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  payPeriodDays?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payFrequency?: string;
}
