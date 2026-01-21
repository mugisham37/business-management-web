import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';

/**
 * Pricing Input Types
 */

@InputType()
export class CreatePricingRuleInput {
  @Field(() => ID)
  customerId!: string;

  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  customPrice!: number;

  @Field(() => Float, { nullable: true })
  discountPercentage?: number;

  @Field({ nullable: true })
  validFrom?: Date;

  @Field({ nullable: true })
  validUntil?: Date;

  @Field({ nullable: true })
  terms?: string;
}

@InputType()
export class UpdatePricingRuleInput {
  @Field(() => ID)
  ruleId!: string;

  @Field(() => Float, { nullable: true })
  customPrice?: number;

  @Field(() => Float, { nullable: true })
  discountPercentage?: number;

  @Field({ nullable: true })
  validUntil?: Date;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class PricingRuleQueryInput {
  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}

@InputType()
export class BulkPricingQueryInput {
  @Field(() => [ID])
  productIds!: string[];

  @Field(() => Float, { nullable: true })
  minQuantity?: number;

  @Field(() => Float, { nullable: true })
  maxQuantity?: number;
}
