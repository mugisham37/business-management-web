import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ReconciliationStatus } from '../types/perpetual-inventory.types';

@InputType()
export class GetCurrentInventoryInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  valuationMethod?: string;
}

@InputType()
export class GetInventoryValueInput {
  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  valuationMethod?: string;
}

@InputType()
export class ReconcileInventoryInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  physicalCount!: number;

  @Field()
  @IsString()
  reason!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class ReconciliationFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ReconciliationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;
}

@InputType()
export class InventoryTrendInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  periodDays?: number;
}
