import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsUUID,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { InventoryAdjustmentReason } from '../types/inventory.types';

@InputType()
export class AdjustInventoryInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  @IsUUID()
  locationId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Adjustment amount (positive or negative)' })
  @IsNumber()
  adjustment!: number;

  @Field(() => InventoryAdjustmentReason)
  @ApiProperty({ description: 'Reason for adjustment', enum: InventoryAdjustmentReason })
  @IsEnum(InventoryAdjustmentReason)
  reason!: InventoryAdjustmentReason;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Notes about the adjustment' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class TransferInventoryInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Source location ID' })
  @IsUUID()
  fromLocationId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Destination location ID' })
  @IsUUID()
  toLocationId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity to transfer' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Transfer notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

@InputType()
export class InventoryFilterInput {
  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @ApiPropertyOptional({ description: 'Filter by location ID' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Filter by zone' })
  @IsOptional()
  @IsString()
  zone?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Show only low stock items' })
  @IsOptional()
  lowStock?: boolean;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Show only out of stock items' })
  @IsOptional()
  outOfStock?: boolean;
}
