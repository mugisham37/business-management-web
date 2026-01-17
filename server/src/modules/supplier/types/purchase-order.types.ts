import { ObjectType, Field, ID, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsUUID,
  IsArray,
  ValidateNested,
  IsDate,
  Min,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  ACKNOWLEDGED = 'acknowledged',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

registerEnumType(PurchaseOrderStatus, { name: 'PurchaseOrderStatus' });

// Object Types
@ObjectType('PurchaseOrder')
export class PurchaseOrderType extends BaseEntity {
  @Field()
  poNumber!: string;

  @Field(() => ID)
  supplierId!: string;

  @Field(() => PurchaseOrderStatus)
  status!: PurchaseOrderStatus;

  @Field()
  orderDate!: Date;

  @Field({ nullable: true })
  expectedDeliveryDate?: Date;

  @Field({ nullable: true })
  requestedDeliveryDate?: Date;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  taxAmount!: number;

  @Field(() => Float)
  shippingAmount!: number;

  @Field(() => Float)
  totalAmount!: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  paymentTerms?: string;

  @Field({ nullable: true })
  shippingMethod?: string;

  @Field({ nullable: true })
  deliveryTerms?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType('PurchaseOrderItem')
export class PurchaseOrderItemType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  purchaseOrderId!: string;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field()
  itemDescription!: string;

  @Field(() => Float)
  quantityOrdered!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  lineTotal!: number;

  @Field(() => Float, { nullable: true })
  quantityReceived?: number;

  @Field({ nullable: true })
  uom?: string;
}

// Input Types
@InputType()
export class PurchaseOrderItemInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  itemDescription!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  quantityOrdered!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  uom?: string;
}

@InputType()
export class CreatePurchaseOrderInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  supplierId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedDeliveryDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  requestedDeliveryDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [PurchaseOrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemInput)
  items!: PurchaseOrderItemInput[];
}

@InputType()
export class UpdatePurchaseOrderInput {
  @Field(() => PurchaseOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedDeliveryDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  requestedDeliveryDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class PurchaseOrderFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => PurchaseOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  orderDateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  orderDateTo?: Date;
}

// Connection Types
@ObjectType()
export class PurchaseOrderEdge extends Edge<PurchaseOrderType> {
  @Field(() => PurchaseOrderType)
  node!: PurchaseOrderType;
}

@ObjectType()
export class PurchaseOrderConnection extends Connection<PurchaseOrderType> {
  @Field(() => [PurchaseOrderEdge])
  edges!: PurchaseOrderEdge[];
}
