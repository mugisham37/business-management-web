import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { 
  IsOptional, 
  IsUUID,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ReorderPriority, ForecastMethod } from '../types/reorder.types';

@InputType()
export class ReorderFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field(() => ReorderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ReorderPriority)
  priority?: ReorderPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  belowReorderPoint?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  criticalStock?: boolean;
}

@InputType()
export class ReorderCalculationInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averageDemand?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  leadTimeDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  serviceLevel?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  demandVariability?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeVariability?: number;
}

@InputType()
export class ForecastInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => ForecastMethod)
  @IsEnum(ForecastMethod)
  method!: ForecastMethod;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  historicalPeriodDays?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  forecastPeriodDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  seasonalityFactor?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  trendFactor?: number;
}

@InputType()
export class PurchaseOrderGenerationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ReorderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ReorderPriority)
  minimumPriority?: ReorderPriority;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumOrderValue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  groupBySupplier?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  respectMinimumOrderValues?: boolean;
}

@InputType()
export class AutomaticReorderInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field(() => ReorderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ReorderPriority)
  minimumPriority?: ReorderPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

@InputType()
export class ReorderPointUpdateInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  useOptimalCalculation?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  updateReorderQuantity?: boolean;
}