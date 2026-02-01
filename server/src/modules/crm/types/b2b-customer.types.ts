import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class B2BAddress {
  @Field({ nullable: true })
  line1?: string;

  @Field({ nullable: true })
  line2?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  country?: string;
}

@ObjectType()
export class B2BCustomer {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  customerNumber!: string;

  @Field()
  companyName!: string;

  @Field({ nullable: true })
  primaryContactFirstName?: string;

  @Field({ nullable: true })
  primaryContactLastName?: string;

  @Field({ nullable: true })
  primaryContactTitle?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  dunsNumber?: string;

  @Field(() => Float)
  creditLimit!: number;

  @Field()
  paymentTermsType!: string;

  @Field(() => Int, { nullable: true })
  customPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  earlyPaymentDiscountPercentage?: number;

  @Field(() => Int, { nullable: true })
  earlyPaymentDiscountDays?: number;

  @Field()
  creditStatus!: string;

  @Field()
  pricingTier!: string;

  @Field(() => Float, { nullable: true })
  volumeDiscountPercentage?: number;

  @Field(() => Float, { nullable: true })
  minimumOrderAmount?: number;

  @Field({ nullable: true })
  salesRepId?: string;

  @Field({ nullable: true })
  accountManagerId?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field(() => Int, { nullable: true })
  employeeCount?: number;

  @Field(() => Float, { nullable: true })
  annualRevenue?: number;

  @Field({ nullable: true })
  contractStartDate?: Date;

  @Field({ nullable: true })
  contractEndDate?: Date;

  @Field(() => Float, { nullable: true })
  contractValue?: number;

  @Field()
  autoRenewal!: boolean;

  @Field({ nullable: true })
  specialInstructions?: string;

  @Field(() => B2BAddress)
  billingAddress!: B2BAddress;

  @Field(() => B2BAddress)
  shippingAddress!: B2BAddress;

  @Field(() => Object)
  b2bMetadata!: Record<string, any>;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CustomerPricingRule {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  customerId!: string;

  @Field({ nullable: true })
  productId?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field()
  ruleType!: string; // 'percentage_discount', 'fixed_discount', 'fixed_price'

  @Field(() => Float)
  value!: number;

  @Field(() => Float, { nullable: true })
  minimumQuantity?: number;

  @Field(() => Float, { nullable: true })
  maximumQuantity?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CustomerCreditHistory {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  customerId!: string;

  @Field()
  eventType!: string; // 'credit_check', 'limit_increase', 'limit_decrease', 'status_change'

  @Field(() => Float, { nullable: true })
  previousCreditLimit?: number;

  @Field(() => Float, { nullable: true })
  newCreditLimit?: number;

  @Field({ nullable: true })
  previousStatus?: string;

  @Field({ nullable: true })
  newStatus?: string;

  @Field({ nullable: true })
  reason?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class B2BCustomerMetrics {
  @Field(() => Int)
  totalB2BCustomers!: number;

  @Field(() => Float)
  totalCreditLimit!: number;

  @Field(() => Float)
  averageCreditLimit!: number;

  @Field(() => Float)
  totalOutstandingCredit!: number;

  @Field(() => Float)
  averageContractValue!: number;

  @Field(() => Int)
  contractsExpiringThisMonth!: number;

  @Field(() => Float)
  averagePaymentTerms!: number;

  @Field(() => Float)
  totalVolumeDiscounts!: number;
}