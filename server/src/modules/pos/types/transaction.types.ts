import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection, PageInfo } from '../../../common/graphql/base.types';
import { PaymentMethodEnum, TransactionStatusEnum } from './pos.types';

// Transaction Item Type
@ObjectType({ description: 'Transaction line item' })
export class TransactionItem {
  @Field(() => ID)
  @ApiProperty({ description: 'Item ID' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field()
  @ApiProperty({ description: 'Product SKU' })
  productSku!: string;

  @Field()
  @ApiProperty({ description: 'Product name' })
  productName!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity' })
  quantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Unit price' })
  unitPrice!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Line total' })
  lineTotal!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Discount amount' })
  discountAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Tax amount' })
  taxAmount!: number;
}

// Payment Record Type
@ObjectType({ description: 'Payment record for a transaction' })
export class PaymentRecord {
  @Field(() => ID)
  @ApiProperty({ description: 'Payment ID' })
  id!: string;

  @Field(() => PaymentMethodEnum)
  @ApiProperty({ enum: PaymentMethodEnum, description: 'Payment method' })
  paymentMethod!: PaymentMethodEnum;

  @Field(() => Float)
  @ApiProperty({ description: 'Payment amount' })
  amount!: number;

  @Field()
  @ApiProperty({ description: 'Payment status' })
  status!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Payment provider', required: false })
  paymentProvider?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Provider transaction ID', required: false })
  providerTransactionId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Processed at', required: false })
  processedAt?: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Refunded amount' })
  refundedAmount!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Refunded at', required: false })
  refundedAt?: Date;
}

// Transaction Type
@ObjectType({ description: 'POS transaction' })
export class Transaction extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Transaction ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Transaction number' })
  transactionNumber!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Customer ID', required: false })
  customerId?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Location ID' })
  locationId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Subtotal' })
  subtotal!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Tax amount' })
  taxAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Discount amount' })
  discountAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Tip amount' })
  tipAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Total amount' })
  total!: number;

  @Field(() => TransactionStatusEnum)
  @ApiProperty({ enum: TransactionStatusEnum, description: 'Transaction status' })
  status!: TransactionStatusEnum;

  @Field(() => Int)
  @ApiProperty({ description: 'Item count' })
  itemCount!: number;

  @Field(() => PaymentMethodEnum)
  @ApiProperty({ enum: PaymentMethodEnum, description: 'Payment method' })
  paymentMethod!: PaymentMethodEnum;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Transaction notes', required: false })
  notes?: string;

  @Field(() => [TransactionItem])
  @ApiProperty({ type: [TransactionItem], description: 'Transaction items' })
  items!: TransactionItem[];
}

// Transaction Edge
@ObjectType()
export class TransactionEdge extends Edge<Transaction> {
  @Field(() => Transaction)
  @ApiProperty({ type: Transaction })
  node!: Transaction;
}

// Transaction Connection
@ObjectType()
export class TransactionConnection extends Connection<Transaction> {
  @Field(() => [TransactionEdge])
  @ApiProperty({ type: [TransactionEdge] })
  edges!: TransactionEdge[];

  @Field(() => PageInfo)
  @ApiProperty({ type: PageInfo })
  pageInfo!: PageInfo;
}
