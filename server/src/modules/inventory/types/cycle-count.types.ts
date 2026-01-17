import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum CycleCountStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RECONCILED = 'reconciled',
  CANCELLED = 'cancelled',
}

export enum StockCountItemStatus {
  PENDING = 'pending',
  COUNTED = 'counted',
  ADJUSTED = 'adjusted',
  SKIPPED = 'skipped',
}

registerEnumType(CycleCountStatus, { name: 'CycleCountStatus' });
registerEnumType(StockCountItemStatus, { name: 'StockCountItemStatus' });

@ObjectType()
export class StockCountItem {
  @Field(() => ID)
  itemId!: string;

  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field(() => Float)
  systemQuantity!: number;

  @Field(() => Float, { nullable: true })
  countedQuantity?: number;

  @Field(() => StockCountItemStatus)
  status!: StockCountItemStatus;

  @Field(() => Float, { nullable: true })
  variance?: number;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class CycleCountSession {
  @Field(() => ID)
  sessionId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field()
  locationName!: string;

  @Field(() => CycleCountStatus)
  status!: CycleCountStatus;

  @Field()
  startDate!: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int)
  totalItems!: number;

  @Field(() => Int)
  countedItems!: number;

  @Field(() => Int)
  pendingItems!: number;

  @Field(() => Int)
  adjustedItems!: number;

  @Field(() => Int)
  skippedItems!: number;

  @Field(() => [StockCountItem])
  items!: StockCountItem[];
}

@ObjectType()
export class CycleCountResult {
  @Field(() => ID)
  countId!: string;

  @Field(() => CycleCountStatus)
  status!: CycleCountStatus;

  @Field(() => Int)
  totalItems!: number;

  @Field(() => Int)
  itemsWithVariance!: number;

  @Field(() => Float)
  variancePercentage!: number;

  @Field(() => Float)
  totalVarianceValue!: number;

  @Field()
  completedDate!: Date;

  @Field(() => [StockCountItem], { nullable: true })
  varianceDetails?: StockCountItem[];
}

@ObjectType()
export class CycleCount {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  locationId!: string;

  @Field()
  name!: string;

  @Field(() => CycleCountStatus)
  status!: CycleCountStatus;

  @Field()
  startDate!: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int)
  totalItems!: number;

  @Field(() => Int)
  countedItems!: number;

  @Field(() => [StockCountItem])
  items!: StockCountItem[];
}

@ObjectType()
export class CycleCountItem {
  @Field(() => ID)
  itemId!: string;

  @Field(() => ID)
  cycleCountId!: string;

  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field(() => Float)
  systemQuantity!: number;

  @Field(() => Float, { nullable: true })
  countedQuantity?: number;

  @Field(() => StockCountItemStatus)
  status!: StockCountItemStatus;

  @Field(() => Float, { nullable: true })
  variance?: number;

  @Field({ nullable: true })
  countedBy?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class CycleCountSummary {
  @Field(() => ID)
  cycleCountId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  totalItemsExpected!: number;

  @Field(() => Int)
  totalItemsCounted!: number;

  @Field(() => Int)
  itemsWithVariance!: number;

  @Field(() => Float)
  accuracyPercentage!: number;

  @Field(() => Float)
  totalVarianceValue!: number;

  @Field()
  completionDate!: Date;

  @Field()
  completedBy!: string;
}
