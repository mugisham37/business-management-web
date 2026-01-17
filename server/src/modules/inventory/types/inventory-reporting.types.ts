import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';

// Enums
export enum ReportType {
  STOCK_LEVEL = 'stock_level',
  MOVEMENT = 'movement',
  AGING = 'aging',
  TURNOVER = 'turnover',
  VALUATION = 'valuation',
  ACCURACY = 'accuracy',
  VARIANCE = 'variance',
}

export enum StockStatus {
  NORMAL = 'normal',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
}

export enum MovementDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum TurnoverCategory {
  FAST_MOVING = 'fast_moving',
  SLOW_MOVING = 'slow_moving',
  DEAD_STOCK = 'dead_stock',
  NORMAL = 'normal',
}

// Register enums
registerEnumType(ReportType, { name: 'ReportType' });
registerEnumType(StockStatus, { name: 'StockStatus' });
registerEnumType(MovementDirection, { name: 'MovementDirection' });
registerEnumType(TurnoverCategory, { name: 'TurnoverCategory' });

@ObjectType()
export class ReportSummary {
  @Field(() => Int)
  totalProducts!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Int)
  lowStockItems!: number;

  @Field(() => Int)
  outOfStockItems!: number;

  @Field(() => Int)
  overstockItems!: number;

  @Field(() => Float)
  averageValue!: number;
}

@ObjectType()
export class StockLevelItem {
  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  sku!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field({ nullable: true })
  variantName?: string;

  @Field(() => ID)
  locationId!: string;

  @Field({ nullable: true })
  locationName?: string;

  @Field(() => Float)
  currentLevel!: number;

  @Field(() => Float)
  availableLevel!: number;

  @Field(() => Float)
  reservedLevel!: number;

  @Field(() => Float)
  reorderPoint!: number;

  @Field(() => Float)
  maxStockLevel!: number;

  @Field(() => Float)
  unitCost!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => StockStatus)
  status!: StockStatus;

  @Field({ nullable: true })
  lastMovementAt?: Date;

  @Field(() => Int, { nullable: true })
  daysWithoutMovement?: number;
}

@ObjectType()
export class StockLevelReport extends BaseEntity {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field()
  generatedAt!: Date;

  @Field(() => [StockLevelItem])
  items!: StockLevelItem[];

  @Field(() => ReportSummary)
  summary!: ReportSummary;
}

@ObjectType()
export class MovementItem {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  sku!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field()
  movementType!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float, { nullable: true })
  unitCost?: number;

  @Field(() => Float, { nullable: true })
  totalCost?: number;

  @Field(() => Float)
  previousLevel!: number;

  @Field(() => Float)
  newLevel!: number;

  @Field({ nullable: true })
  referenceType?: string;

  @Field(() => ID, { nullable: true })
  referenceId?: string;

  @Field({ nullable: true })
  referenceNumber?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt!: Date;

  @Field(() => MovementDirection)
  direction!: MovementDirection;
}

@ObjectType()
export class MovementSummary {
  @Field(() => Int)
  totalMovements!: number;

  @Field(() => Float)
  totalInbound!: number;

  @Field(() => Float)
  totalOutbound!: number;

  @Field(() => Float)
  netMovement!: number;

  @Field(() => Float)
  totalValue!: number;
}

@ObjectType()
export class MovementReport extends BaseEntity {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field()
  generatedAt!: Date;

  @Field(() => [MovementItem])
  movements!: MovementItem[];

  @Field(() => MovementSummary)
  summary!: MovementSummary;
}

@ObjectType()
export class AgingItem {
  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  sku!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  unitCost!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Int)
  daysInStock!: number;

  @Field()
  receivedDate!: Date;

  @Field({ nullable: true })
  expiryDate?: Date;

  @Field(() => Int, { nullable: true })
  daysUntilExpiry?: number;

  @Field()
  isExpired!: boolean;

  @Field()
  isNearExpiry!: boolean;
}

@ObjectType()
export class AgingSummary {
  @Field(() => Int)
  totalItems!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Int)
  expiredItems!: number;

  @Field(() => Float)
  expiredValue!: number;

  @Field(() => Int)
  nearExpiryItems!: number;

  @Field(() => Float)
  nearExpiryValue!: number;

  @Field(() => Float)
  averageDaysInStock!: number;
}

@ObjectType()
export class AgingReport extends BaseEntity {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field()
  generatedAt!: Date;

  @Field(() => [AgingItem])
  items!: AgingItem[];

  @Field(() => AgingSummary)
  summary!: AgingSummary;
}

@ObjectType()
export class TurnoverItem {
  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  sku!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  averageInventory!: number;

  @Field(() => Float)
  costOfGoodsSold!: number;

  @Field(() => Float)
  turnoverRatio!: number;

  @Field(() => Int)
  daysSalesInventory!: number;

  @Field(() => TurnoverCategory)
  category!: TurnoverCategory;

  @Field(() => Float)
  totalValue!: number;

  @Field({ nullable: true })
  lastSaleDate?: Date;

  @Field(() => Int, { nullable: true })
  daysSinceLastSale?: number;
}

@ObjectType()
export class TurnoverSummary {
  @Field(() => Int)
  totalProducts!: number;

  @Field(() => Float)
  averageTurnoverRatio!: number;

  @Field(() => Int)
  fastMovingItems!: number;

  @Field(() => Int)
  slowMovingItems!: number;

  @Field(() => Int)
  deadStockItems!: number;

  @Field(() => Float)
  deadStockValue!: number;
}

@ObjectType()
export class TurnoverReport extends BaseEntity {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field()
  generatedAt!: Date;

  @Field(() => [TurnoverItem])
  items!: TurnoverItem[];

  @Field(() => TurnoverSummary)
  summary!: TurnoverSummary;
}