import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum BatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
  QUARANTINED = 'quarantined',
}

export enum BatchTrackingMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  WEIGHTED_AVERAGE = 'weighted_average',
  SPECIFIC_IDENTIFICATION = 'specific_identification',
}

registerEnumType(BatchStatus, { name: 'BatchStatus' });
registerEnumType(BatchTrackingMethod, { name: 'BatchTrackingMethod' });

@ObjectType()
export class BatchTrackingInfo {
  @Field(() => ID)
  batchId!: string;

  @Field()
  batchNumber!: string;

  @Field(() => Float)
  quantity!: number;

  @Field()
  receivedDate!: Date;

  @Field({ nullable: true })
  expiryDate?: Date;

  @Field(() => BatchStatus)
  status!: BatchStatus;

  @Field(() => Float)
  unitCost!: number;

  @Field(() => Float)
  totalValue!: number;
}

@ObjectType()
export class BatchMovement {
  @Field(() => ID)
  movementId!: string;

  @Field()
  date!: Date;

  @Field()
  type!: string;

  @Field(() => Float)
  quantity!: number;

  @Field({ nullable: true })
  reference?: string;
}

@ObjectType()
export class BatchTrackingResult {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => [BatchTrackingInfo])
  batches!: BatchTrackingInfo[];

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  totalValue!: number;
}

@ObjectType()
export class BatchAgeAnalysis {
  @Field(() => Int)
  daysOld!: number;

  @Field(() => Int)
  batchCount!: number;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  value!: number;

  @Field(() => Float)
  percentageOfTotal!: number;
}

@ObjectType()
export class BatchExpiryAlert {
  @Field(() => ID)
  batchId!: string;

  @Field()
  batchNumber!: string;

  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  expiryDate!: Date;

  @Field(() => Int)
  daysUntilExpiry!: number;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  value!: number;
}
