import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsDateString, IsEnum, Length } from 'class-validator';
import { CycleCountStatus, StockCountItemStatus } from '../types/cycle-count.types';

@InputType()
export class CreateCycleCountInput {
  @Field()
  @IsString()
  @Length(1, 50)
  sessionNumber!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  productIds?: string[];
}

@InputType()
export class UpdateCycleCountStatusInput {
  @Field(() => ID)
  @IsUUID()
  sessionId!: string;

  @Field(() => CycleCountStatus)
  @IsEnum(CycleCountStatus)
  status!: CycleCountStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class StockCountItemInput {
  @Field(() => ID)
  @IsUUID()
  itemId!: string;

  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field()
  @IsString()
  productName!: string;

  @Field(() => Int)
  countedQuantity!: number;

  @Field(() => StockCountItemStatus)
  @IsEnum(StockCountItemStatus)
  status!: StockCountItemStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Alias for compatibility
export type CountItemInput = StockCountItemInput;

@InputType()
export class RecordStockCountInput {
  @Field(() => ID)
  @IsUUID()
  sessionId!: string;

  @Field(() => [StockCountItemInput])
  items!: StockCountItemInput[];
}

@InputType()
export class CycleCountFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => CycleCountStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CycleCountStatus)
  status?: CycleCountStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;
}
