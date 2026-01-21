import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';

/**
 * Contract Input Types
 */

@InputType()
export class ContractLineItemInput {
  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateContractInput {
  @Field(() => ID)
  customerId!: string;

  @Field()
  contractNumber!: string;

  @Field({ nullable: true })
  contractType?: string;

  @Field(() => [ContractLineItemInput])
  lineItems!: ContractLineItemInput[];

  @Field(() => Float, { nullable: true })
  totalValue?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  terms?: string;

  @Field({ nullable: true })
  specialConditions?: string;
}

@InputType()
export class UpdateContractInput {
  @Field(() => ID)
  contractId!: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  terms?: string;

  @Field({ nullable: true })
  internalNotes?: string;
}

@InputType()
export class ContractQueryInput {
  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
