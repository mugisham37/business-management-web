import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsUUID,
  IsEnum,
  IsDateString,
  Min,
  Length,
} from 'class-validator';
import { InventoryAdjustmentReason, InventoryValuationMethod } from '../types/inventory.types';

@InputType()
export class AdjustInventoryInput {
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

  @Field(() => Float)
  @IsNumber()
  adjustment!: number;

  @Field(() => InventoryAdjustmentReason)
  @IsEnum(InventoryAdjustmentReason)
  reason!: InventoryAdjustmentReason;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  batchNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lotNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

@InputType()
export class TransferInventoryInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID)
  @IsUUID()
  fromLocationId!: string;

  @Field(() => ID)
  @IsUUID()
  toLocationId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}

@InputType()
export class InventoryFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zone?: string;

  @Field({ nullable: true })
  @IsOptional()
  lowStock?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  outOfStock?: boolean;
}

@InputType()
export class CreateInventoryLevelInput {
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

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderQuantity?: number;

  @Field(() => InventoryValuationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryValuationMethod)
  valuationMethod?: InventoryValuationMethod;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averageCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  binLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  zone?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  attributes?: Record<string, any>;
}

@InputType()
export class UpdateInventoryLevelInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderQuantity?: number;

  @Field(() => InventoryValuationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryValuationMethod)
  valuationMethod?: InventoryValuationMethod;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averageCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  binLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  zone?: string;
}

@InputType()
export class ReserveInventoryInput {
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

  @Field(() => Float)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @Field()
  @IsString()
  @Length(1, 50)
  reservedFor!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  referenceId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  reservedUntil?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
