import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Contract status enum
 */
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

registerEnumType(ContractStatus, {
  name: 'ContractStatus',
  description: 'Status of a B2B contract',
});

/**
 * Contract GraphQL type
 * Represents a B2B contract with lifecycle management
 */
@ObjectType()
export class ContractType {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique contract identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Tenant identifier' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Contract number' })
  contractNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Customer identifier' })
  customerId!: string;

  @Field(() => ContractStatus)
  @ApiProperty({ enum: ContractStatus, description: 'Contract status' })
  status!: ContractStatus;

  @Field()
  @ApiProperty({ description: 'Contract type' })
  contractType!: string;

  @Field()
  @ApiProperty({ description: 'Contract title' })
  title!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Contract description', required: false })
  description?: string;

  @Field()
  @ApiProperty({ description: 'Contract start date' })
  startDate!: Date;

  @Field()
  @ApiProperty({ description: 'Contract end date' })
  endDate!: Date;

  @Field()
  @ApiProperty({ description: 'Auto-renewal enabled' })
  autoRenewal!: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Renewal term in months', required: false })
  renewalTermMonths?: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Renewal notice days' })
  renewalNoticeDays!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Contract value', required: false })
  contractValue?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Minimum commitment', required: false })
  minimumCommitment?: number;

  @Field()
  @ApiProperty({ description: 'Payment terms' })
  paymentTerms!: string;

  @Field()
  @ApiProperty({ description: 'Pricing model' })
  pricingModel!: string;

  @Field()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  // Field resolvers
  @Field({ nullable: true })
  @ApiProperty({ description: 'Customer details', required: false })
  customer?: any;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Pricing agreements', required: false })
  pricingAgreements?: any;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Sales representative', required: false })
  salesRep?: any;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Account manager', required: false })
  accountManager?: any;
}

/**
 * Contract list response type
 */
@ObjectType()
export class ContractListResponse {
  @Field(() => [ContractType])
  @ApiProperty({ type: [ContractType], description: 'List of contracts' })
  contracts!: ContractType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Total count of contracts' })
  total!: number;
}
