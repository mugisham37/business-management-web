import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { PaymentTerms, AddressInput } from '../types/b2b-order.types';

/**
 * B2B Order Input Types
 */

@InputType()
export class B2BOrderItemInput {
  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  metadata?: string;
}

@InputType()
export class CreateB2BOrderInput {
  @Field(() => ID)
  customerId!: string;

  @Field(() => [B2BOrderItemInput])
  items!: B2BOrderItemInput[];

  @Field(() => PaymentTerms)
  paymentTerms!: PaymentTerms;

  @Field(() => AddressInput, { nullable: true })
  shippingAddress?: AddressInput;

  @Field(() => AddressInput, { nullable: true })
  billingAddress?: AddressInput;

  @Field({ nullable: true })
  deliveryTerms?: string;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field({ nullable: true })
  specialInstructions?: string;

  @Field({ nullable: true })
  internalNotes?: string;
}

@InputType()
export class UpdateB2BOrderInput {
  @Field(() => ID)
  orderId!: string;

  @Field(() => [B2BOrderItemInput], { nullable: true })
  items?: B2BOrderItemInput[];

  @Field({ nullable: true })
  status?: string;

  @Field(() => PaymentTerms, { nullable: true })
  paymentTerms?: PaymentTerms;

  @Field({ nullable: true })
  specialInstructions?: string;

  @Field({ nullable: true })
  internalNotes?: string;
}

@InputType()
export class B2BOrderQueryInput {
  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;

  @Field({ nullable: true })
  searchTerm?: string;
}
