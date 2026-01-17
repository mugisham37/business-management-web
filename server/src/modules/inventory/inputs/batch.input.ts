import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsDateString, IsNumber, IsEnum, Min, Length } from 'class-validator';
import { BatchStatus, BatchTrackingMethod } from '../types/batch.types';

@InputType()
export class CreateBatchInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  batchNumber!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.001)
  originalQuantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitCost!: number;

  @Field()
  @IsDateString()
  receivedDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateBatchInput {
  @Field(() => ID)
  @IsUUID()
  batchId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => BatchStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;
}

@InputType()
export class BatchMovementInput {
  @Field(() => ID)
  @IsUUID()
  batchId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @Field()
  @IsString()
  type!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class BatchFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => BatchStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDateTo?: string;
}
