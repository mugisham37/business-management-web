import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodEnum } from '../types/pos.types';

@InputType({ description: 'Transaction item input' })
export class CreateTransactionItemInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId!: string;

  @Field()
  @ApiProperty({ description: 'Product SKU' })
  @IsString()
  productSku!: string;

  @Field()
  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity', minimum: 0.001 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Unit price', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice!: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;
}

@InputType({ description: 'Create transaction input' })
export class CreateTransactionInput {
  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId!: string;

  @Field(() => [CreateTransactionItemInput])
  @ApiProperty({ description: 'Transaction items', type: [CreateTransactionItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemInput)
  items!: CreateTransactionItemInput[];

  @Field(() => PaymentMethodEnum)
  @ApiProperty({ enum: PaymentMethodEnum, description: 'Payment method' })
  @IsEnum(PaymentMethodEnum)
  paymentMethod!: PaymentMethodEnum;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ description: 'Tax amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ description: 'Tip amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tipAmount?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Transaction notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Update transaction input' })
export class UpdateTransactionInput {
  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Transaction notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Void transaction input' })
export class VoidTransactionInput {
  @Field()
  @ApiProperty({ description: 'Reason for voiding' })
  @IsString()
  reason!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Refund transaction input' })
export class RefundTransactionInput {
  @Field(() => Float)
  @ApiProperty({ description: 'Refund amount', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @Field()
  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  reason!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Transaction query filters' })
export class TransactionQueryInput {
  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Transaction status' })
  @IsOptional()
  @IsString()
  status?: string;
}
