import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Territory type enum
 */
export enum TerritoryType {
  GEOGRAPHIC = 'geographic',
  INDUSTRY = 'industry',
  ACCOUNT_SIZE = 'account_size',
  PRODUCT_LINE = 'product_line',
  HYBRID = 'hybrid',
}

registerEnumType(TerritoryType, {
  name: 'TerritoryType',
  description: 'Type of territory segmentation',
});

/**
 * Territory GraphQL type
 * Represents a B2B sales territory
 */
@ObjectType()
export class TerritoryGraphQLType {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique territory identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Tenant identifier' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Territory code' })
  territoryCode!: string;

  @Field()
  @ApiProperty({ description: 'Territory name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Territory description', required: false })
  description?: string;

  @Field(() => TerritoryType)
  @ApiProperty({ enum: TerritoryType, description: 'Territory type' })
  territoryType!: TerritoryType;

  @Field()
  @ApiProperty({ description: 'Territory active status' })
  isActive!: boolean;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Annual revenue target', required: false })
  annualRevenueTarget?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Quarterly revenue target', required: false })
  quarterlyRevenueTarget?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Customer acquisition target', required: false })
  customerAcquisitionTarget?: number;

  @Field()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  // Field resolvers
  @Field(() => [CustomerType])
  @ApiProperty({ type: [CustomerType], description: 'Customers in territory' })
  customers!: any[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Primary sales representative', required: false })
  salesRep?: any;

  @Field(() => [UserType], { nullable: true })
  @ApiProperty({ description: 'Secondary sales representatives', required: false })
  secondarySalesReps?: any[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Territory manager', required: false })
  manager?: any;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of customers in territory' })
  customerCount!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Target achievement percentage' })
  targetAchievement!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Current period revenue' })
  currentRevenue!: number;
}

/**
 * Territory customer assignment GraphQL type
 */
@ObjectType()
export class TerritoryCustomerAssignmentType {
  @Field(() => ID)
  @ApiProperty({ description: 'Assignment identifier' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Territory identifier' })
  territoryId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Customer identifier' })
  customerId!: string;

  @Field()
  @ApiProperty({ description: 'Assignment date' })
  assignedDate!: Date;

  @Field()
  @ApiProperty({ description: 'Assignment active status' })
  isActive!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Assignment reason', required: false })
  assignmentReason?: string;
}

/**
 * Territory performance metrics GraphQL type
 */
@ObjectType()
export class TerritoryPerformanceType {
  @Field(() => ID)
  @ApiProperty({ description: 'Territory identifier' })
  territoryId!: string;

  @Field()
  @ApiProperty({ description: 'Territory name' })
  territoryName!: string;

  @Field()
  @ApiProperty({ description: 'Performance period' })
  period!: any;

  @Field()
  @ApiProperty({ description: 'Performance metrics' })
  metrics!: any;

  @Field()
  @ApiProperty({ description: 'Sales representative information' })
  salesRep!: any;
}

/**
 * Territory list response type
 */
@ObjectType()
export class TerritoryListResponse {
  @Field(() => [TerritoryGraphQLType])
  @ApiProperty({ type: [TerritoryGraphQLType], description: 'List of territories' })
  territories!: TerritoryGraphQLType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Total count of territories' })
  total!: number;
}

/**
 * Territory customers response type
 */
@ObjectType()
export class TerritoryCustomersResponse {
  @Field(() => [CustomerType])
  @ApiProperty({ type: [CustomerType], description: 'List of customers' })
  customers!: any[];

  @Field(() => Int)
  @ApiProperty({ description: 'Total count of customers' })
  total!: number;
}

/**
 * Bulk assignment response type
 */
@ObjectType()
export class BulkAssignmentResponse {
  @Field(() => [TerritoryCustomerAssignmentType])
  @ApiProperty({ type: [TerritoryCustomerAssignmentType], description: 'List of assignments' })
  assignments!: TerritoryCustomerAssignmentType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Count of assignments' })
  count!: number;
}

// Placeholder types for field resolvers
class CustomerType {}
class UserType {}
