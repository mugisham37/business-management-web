import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { PaymentTerms } from '../types/b2b-order.types';

/**
 * Quote Input Types
 */

@InputType()
export class QuoteItemInput {
  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  quantity!: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  metadata?: string;
}

@InputType()
export class CreateQuoteInput {
  @Field(() => ID)
  customerId!: string;

  @Field(() => [QuoteItemInput])
  items!: QuoteItemInput[];

  @Field(() => PaymentTerms)
  paymentTerms!: PaymentTerms;

  @Field(() => Int, { nullable: true, defaultValue: 30 })
  validityDays?: number;

  @Field({ nullable: true })
  deliveryTerms?: string;

  @Field({ nullable: true })
  termsAndConditions?: string;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field(() => ID, { nullable: true })
  salesRepId?: string;

  @Field({ nullable: true })
  specialInstructions?: string;
}

@InputType()
export class UpdateQuoteInput {
  @Field(() => ID)
  quoteId!: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field({ nullable: true })
  internalNotes?: string;
}

@InputType()
export class SendQuoteInput {
  @Field(() => ID)
  quoteId!: string;

  @Field()
  emailSubject!: string;

  @Field()
  emailMessage!: string;

  @Field({ nullable: true })
  recipientEmail?: string;

  @Field({ nullable: true })
  ccEmails?: string;

  @Field({ nullable: true })
  attachments?: string;
}

@InputType()
export class QuoteQueryInput {
  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
