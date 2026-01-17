import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';

export enum PerpetualInventoryStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISCREPANCY_FOUND = 'discrepancy_found',
}

registerEnumType(PerpetualInventoryStatusEnum, { name: 'PerpetualInventoryStatus' });
registerEnumType(ReconciliationStatus, { name: 'ReconciliationStatus' });

@ObjectType()
export class InventorySnapshot {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  value!: number;

  @Field()
  timestamp!: Date;

  @Field(() => Float, { nullable: true })
  costPerUnit?: number;
}

@ObjectType()
export class InventoryReconciliation {
  @Field(() => ID)
  reconciliationId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => ReconciliationStatus)
  status!: ReconciliationStatus;

  @Field()
  startDate!: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int)
  itemsProcessed!: number;

  @Field(() => Int)
  discrepanciesFound!: number;

  @Field(() => Float)
  totalDiscrepancyValue!: number;

  @Field(() => [InventorySnapshot])
  snapshots!: InventorySnapshot[];
}

@ObjectType()
export class InventoryTrendAnalysis {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => [Float])
  quantities!: number[];

  @Field(() => [Float])
  values!: number[];

  @Field(() => [String])
  timestamps!: string[];

  @Field(() => Float)
  averageQuantity!: number;

  @Field(() => Float)
  averageValue!: number;

  @Field(() => Float)
  trend!: number;
}

@ObjectType()
export class InventoryValuationData {
  @Field(() => ID)
  locationId!: string;

  @Field(() => Int)
  totalItems!: number;

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  averageCostPerUnit!: number;

  @Field(() => [InventorySnapshot])
  topItems!: InventorySnapshot[];
}

@ObjectType()
export class PerpetualInventoryStatusData {
  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Int)
  itemCount!: number;

  @Field(() => Int)
  lastUpdateMinutesAgo!: number;

  @Field()
  lastUpdateTime!: Date;

  @Field({ nullable: true })
  nextReconciliationDate?: Date;
}

@ObjectType()
export class PerpetualInventoryLevelData {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  currentQuantity!: number;

  @Field(() => Float)
  reservedQuantity!: number;

  @Field(() => Float)
  availableQuantity!: number;

  @Field(() => Float)
  costPerUnit!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field()
  lastUpdated!: Date;

  @Field(() => PerpetualInventoryStatusEnum)
  status!: PerpetualInventoryStatusEnum;
}

@ObjectType()
export class InventoryValue {
  @Field(() => ID)
  locationId!: string;

  @Field(() => [InventorySnapshot])
  items!: InventorySnapshot[];

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field()
  valuationMethod!: string;

  @Field()
  lastUpdated!: Date;
}
