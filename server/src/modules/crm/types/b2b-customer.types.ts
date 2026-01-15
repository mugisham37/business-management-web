import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class B2BAddressType {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  line1?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  line2?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  city?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  state?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  postalCode?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  country?: string;
}

@ObjectType()
export class B2BCustomerType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field()
  @ApiProperty()
  tenantId!: string;

  @Field()
  @ApiProperty()
  customerNumber!: string;

  @Field()
  @ApiProperty()
  companyName!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  primaryContactFirstName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  primaryContactLastName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  primaryContactTitle?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  email?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  website?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  taxId?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  dunsNumber?: string;

  @Field(() => Float)
  @ApiProperty()
  creditLimit!: number;

  @Field()
  @ApiProperty()
  paymentTermsType!: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  customPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  earlyPaymentDiscountPercentage?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  earlyPaymentDiscountDays?: number;

  @Field()
  @ApiProperty()
  creditStatus!: string;

  @Field()
  @ApiProperty()
  pricingTier!: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  volumeDiscountPercentage?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  minimumOrderAmount?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  salesRepId?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  accountManagerId?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  industry?: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  employeeCount?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  annualRevenue?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  contractStartDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  contractEndDate?: Date;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  contractValue?: number;

  @Field()
  @ApiProperty()
  autoRenewal!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  specialInstructions?: string;

  @Field(() => B2BAddressType)
  @ApiProperty({ type: B2BAddressType })
  billingAddress!: B2BAddressType;

  @Field(() => B2BAddressType)
  @ApiProperty({ type: B2BAddressType })
  shippingAddress!: B2BAddressType;

  @Field()
  @ApiProperty()
  createdAt!: Date;

  @Field()
  @ApiProperty()
  updatedAt!: Date;

  // Field resolvers - these will be populated by the resolver
  @Field(() => B2BCustomerType, { nullable: true })
  @ApiProperty({ type: () => B2BCustomerType, required: false })
  parentCustomer?: B2BCustomerType;

  @Field(() => [B2BCustomerType], { nullable: true })
  @ApiProperty({ type: [B2BCustomerType], required: false })
  childCustomers?: B2BCustomerType[];

  @Field(() => [Object], { nullable: true })
  @ApiProperty({ required: false })
  contracts?: any[];

  @Field(() => [Object], { nullable: true })
  @ApiProperty({ required: false })
  orders?: any[];
}
