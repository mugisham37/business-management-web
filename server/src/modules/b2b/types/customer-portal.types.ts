import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Portal customer GraphQL type
 * Represents a customer in the B2B portal
 */
@ObjectType()
export class PortalCustomerType {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique customer identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Tenant identifier' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Company name' })
  companyName!: string;

  @Field()
  @ApiProperty({ description: 'First name' })
  firstName!: string;

  @Field()
  @ApiProperty({ description: 'Last name' })
  lastName!: string;

  @Field()
  @ApiProperty({ description: 'Email address' })
  email!: string;

  @Field()
  @ApiProperty({ description: 'Phone number' })
  phone!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Credit limit' })
  creditLimit!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Available credit' })
  availableCredit!: number;

  @Field()
  @ApiProperty({ description: 'Payment terms' })
  paymentTerms!: string;

  @Field()
  @ApiProperty({ description: 'Pricing tier' })
  pricingTier!: string;

  // Field resolvers
  @Field({ nullable: true })
  @ApiProperty({ description: 'Account manager', required: false })
  accountManager?: any;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Sales representative', required: false })
  salesRep?: any;

  @Field(() => Float)
  @ApiProperty({ description: 'Credit utilization percentage' })
  creditUtilization!: number;

  @Field(() => [ContractType], { nullable: true })
  @ApiProperty({ description: 'Active contracts', required: false })
  activeContracts?: any[];
}

/**
 * Portal product GraphQL type
 * Represents a product in the customer portal catalog
 */
@ObjectType()
export class PortalProductType {
  @Field(() => ID)
  @ApiProperty({ description: 'Product identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Product SKU' })
  sku!: string;

  @Field()
  @ApiProperty({ description: 'Product name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Product description', required: false })
  description?: string;

  @Field()
  @ApiProperty({ description: 'Product category' })
  category!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Base price' })
  basePrice!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Customer-specific price' })
  customerPrice!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Discount percentage' })
  discountPercentage!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Available quantity' })
  availableQuantity!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Minimum order quantity' })
  minimumOrderQuantity!: number;
}

/**
 * Portal order GraphQL type
 * Represents an order placed through the customer portal
 */
@ObjectType()
export class PortalOrderType {
  @Field(() => ID)
  @ApiProperty({ description: 'Order identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Order number' })
  orderNumber!: string;

  @Field()
  @ApiProperty({ description: 'Order status' })
  status!: string;

  @Field()
  @ApiProperty({ description: 'Order date' })
  orderDate!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Requested delivery date', required: false })
  requestedDeliveryDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Confirmed delivery date', required: false })
  confirmedDeliveryDate?: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Subtotal amount' })
  subtotal!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Tax amount' })
  taxAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Shipping amount' })
  shippingAmount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Total amount' })
  totalAmount!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Tracking number', required: false })
  trackingNumber?: string;

  @Field(() => [PortalOrderItemType])
  @ApiProperty({ type: [PortalOrderItemType], description: 'Order items' })
  items!: PortalOrderItemType[];
}

/**
 * Portal order item GraphQL type
 */
@ObjectType()
export class PortalOrderItemType {
  @Field(() => ID)
  @ApiProperty({ description: 'Order item identifier' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product identifier' })
  productId!: string;

  @Field()
  @ApiProperty({ description: 'Product SKU' })
  sku!: string;

  @Field()
  @ApiProperty({ description: 'Product name' })
  productName!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Quantity ordered' })
  quantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Unit price' })
  unitPrice!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Line total' })
  lineTotal!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Quantity shipped' })
  quantityShipped!: number;
}

/**
 * Portal dashboard response type
 */
@ObjectType()
export class PortalDashboardType {
  @Field(() => PortalCustomerType)
  @ApiProperty({ type: PortalCustomerType, description: 'Customer information' })
  customer!: PortalCustomerType;

  @Field(() => [PortalOrderType])
  @ApiProperty({ type: [PortalOrderType], description: 'Recent orders' })
  recentOrders!: PortalOrderType[];

  @Field()
  @ApiProperty({ description: 'Dashboard summary' })
  summary!: any;
}

/**
 * Portal orders list response type
 */
@ObjectType()
export class PortalOrdersResponse {
  @Field(() => [PortalOrderType])
  @ApiProperty({ type: [PortalOrderType], description: 'List of orders' })
  orders!: PortalOrderType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Total count of orders' })
  total!: number;
}

/**
 * Portal product catalog response type
 */
@ObjectType()
export class PortalProductCatalogResponse {
  @Field(() => [PortalProductType])
  @ApiProperty({ type: [PortalProductType], description: 'List of products' })
  products!: PortalProductType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Total count of products' })
  total!: number;
}

/**
 * Portal authentication response type
 */
@ObjectType()
export class PortalAuthResponse {
  @Field(() => PortalCustomerType)
  @ApiProperty({ type: PortalCustomerType, description: 'Customer information' })
  customer!: PortalCustomerType;

  @Field()
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;
}

// Re-export ContractType for use in portal types
class ContractType {}
