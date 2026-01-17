import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { 
  IsOptional, 
  IsUUID,
  IsEnum,
  IsDateString,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { AnalysisType, MovementPattern } from '../types/movement-tracking.types';

@InputType()
export class DetailedMovementFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  movementType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeSystemMovements?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeAdjustments?: boolean;
}

@InputType()
export class MovementAnalysisInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => AnalysisType)
  @IsEnum(AnalysisType)
  analysisType!: AnalysisType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  periodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

@InputType()
export class VelocityAnalysisInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  periodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class PatternAnalysisInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => MovementPattern)
  @IsEnum(MovementPattern)
  patternType!: MovementPattern;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  periodDays?: number;
}

@InputType()
export class AccuracyAnalysisInput {
  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  periodDays?: number;
}

@InputType()
export class AnomalyDetectionInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  lookbackDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeResolved?: boolean;
}

@InputType()
export class AuditTrailInput {
  @Field(() => ID)
  @IsUUID()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  locationId!: string;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeMovementDetails?: boolean;
}