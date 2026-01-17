import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';

// Register the valuation method enum
export enum ValuationMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  AVERAGE = 'average',
  SPECIFIC = 'specific',
}

registerEnumType(ValuationMethod, {
  name: 'ValuationMethod',
  description: 'Inventory valuation methods',
});

@ObjectType()
export class BatchValuation {
  @Field(() => ID)
  batchId!: string;

  @Field()
  batchNumber!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  unitCost!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field()
  receivedDate!: Date;

  @Field({ nullable: true })
  expiryDate?: Date;
}

@ObjectType()
export class InventoryValuationResult {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  currentQuantity!: number;

  @Field(() => ValuationMethod)
  valuationMethod!: ValuationMethod;

  @Field(() => Float)
  unitCost!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => [BatchValuation], { nullable: true })
  batches?: BatchValuation[];
}

@ObjectType()
export class LocationValuation {
  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  averageCost!: number;

  @Field(() => Int)
  productCount!: number;
}

@ObjectType()
export class ProductValuation {
  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  averageCost!: number;

  @Field(() => Int)
  locationCount!: number;
}

@ObjectType()
export class InventoryValuationSummary {
  @Field(() => Float)
  totalInventoryValue!: number;

  @Field(() => Float)
  totalQuantity!: number;

  @Field(() => Float)
  averageCost!: number;

  @Field(() => [LocationValuation])
  valuationsByLocation!: LocationValuation[];

  @Field(() => [ProductValuation])
  valuationsByProduct!: ProductValuation[];
}