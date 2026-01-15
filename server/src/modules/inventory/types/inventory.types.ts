import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

// Enums
export enum InventoryMovementType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  ADJUSTMENT = 'adjustment',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  RETURN = 'return',
  DAMAGE = 'damage',
  THEFT = 'theft',
  EXPIRED = 'expired',
  RECOUNT = 'recount',
  PRODUCTION = 'production',
  CONSUMPTION = 'consumption',
}

export enum InventoryAdjustmentReason {
  MANUAL_COUNT = 'manual_count',
  CYCLE_COUNT = 'cycle_count',
  DAMAGED_GOODS = 'damaged_goods',
  EXPIRED_GOODS = 'expired_goods',
  THEFT_LOSS = 'theft_loss',
  SUPPLIER_ERROR = 'supplier_error',
  SYSTEM_ERROR = 'system_error',
  RETURN_TO_VENDOR = 'return_to_vendor',
  PROMOTIONAL_USE = 'promotional_use',
  INTERNAL_USE = 'internal_use',
  OTHER = 'other',
}

export enum InventoryValuationMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  AVERAGE = 'average',
  SPECIFIC = 'specific',
}

// Register enums for GraphQL
registerEnumType(InventoryMovementType, { name: 'InventoryMovementType' });
registerEnumType(InventoryAdjustmentReason, { name: 'InventoryAdjustmentReason' });
registerEnumType(InventoryValuationMethod, { name: 'InventoryValuationMethod' });

@ObjectType()
export class InventoryLevel extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Inventory level ID' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Product variant ID', required: false })
  variantId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  locationId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Current stock level' })
  currentLevel!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Available stock level (current - reserved)' })
  availableLevel!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Reserved stock level' })
  reservedLevel!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Minimum stock level' })
  minStockLevel!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Maximum stock level', required: false })
  maxStockLevel?: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Reorder point' })
  reorderPoint!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Reorder quantity' })
  reorderQuantity!: number;

  @Field(() => InventoryValuationMethod)
  @ApiProperty({ description: 'Valuation method', enum: InventoryValuationMethod })
  valuationMethod!: InventoryValuationMethod;

  @Field(() => Float)
  @ApiProperty({ description: 'Average cost per unit' })
  averageCost!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Total inventory value' })
  totalValue!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Bin location', required: false })
  binLocation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Zone', required: false })
  zone?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last movement timestamp', required: false })
  lastMovementAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last count timestamp', required: false })
  lastCountAt?: Date;

  @Field()
  @ApiProperty({ description: 'Low stock alert sent flag' })
  lowStockAlertSent!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last alert sent timestamp', required: false })
  lastAlertSentAt?: Date;

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  // Field resolvers will populate these
  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Product information', required: false })
  product?: any;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Location information', required: false })
  location?: any;
}

@ObjectType()
export class InventoryMovement extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Movement ID' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Product variant ID', required: false })
  variantId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  locationId!: string;

  @Field(() => InventoryMovementType)
  @ApiProperty({ description: 'Movement type', enum: InventoryMovementType })
  movementType!: InventoryMovementType;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity moved (positive for in, negative for out)' })
  quantity!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Unit cost', required: false })
  unitCost?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Total cost', required: false })
  totalCost?: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Stock level before movement' })
  previousLevel!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Stock level after movement' })
  newLevel!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reference document type', required: false })
  referenceType?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Reference document ID', required: false })
  referenceId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reference document number', required: false })
  referenceNumber?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Batch number', required: false })
  batchNumber?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Lot number', required: false })
  lotNumber?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Expiry date', required: false })
  expiryDate?: Date;

  @Field(() => InventoryAdjustmentReason, { nullable: true })
  @ApiProperty({ description: 'Adjustment reason', enum: InventoryAdjustmentReason, required: false })
  reason?: InventoryAdjustmentReason;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Movement notes', required: false })
  notes?: string;

  @Field()
  @ApiProperty({ description: 'Requires approval flag' })
  requiresApproval!: boolean;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Approved by user ID', required: false })
  approvedBy?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Approval timestamp', required: false })
  approvedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Source bin location', required: false })
  fromBinLocation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Destination bin location', required: false })
  toBinLocation?: string;

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  // Field resolvers will populate these
  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Product information', required: false })
  product?: any;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Location information', required: false })
  location?: any;
}
