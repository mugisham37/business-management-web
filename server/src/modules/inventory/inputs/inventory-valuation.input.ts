import { InputType, Field, ID } from '@nestjs/graphql';
import { 
  IsOptional, 
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { InventoryValuationMethod } from '../types/inventory.types';

@InputType()
export class ValuationFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @Field(() => InventoryValuationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryValuationMethod)
  valuationMethod?: InventoryValuationMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  includeZeroQuantity?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeBatchDetails?: boolean;
}

@InputType()
export class UpdateValuationInput {
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

  @Field(() => InventoryValuationMethod)
  @IsEnum(InventoryValuationMethod)
  valuationMethod!: InventoryValuationMethod;

  @Field({ nullable: true })
  @IsOptional()
  recalculateFromDate?: string;
}