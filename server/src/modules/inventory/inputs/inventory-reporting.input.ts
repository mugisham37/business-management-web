import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { 
  IsOptional, 
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ReportType, StockStatus, MovementDirection, TurnoverCategory } from '../types/inventory-reporting.types';

@InputType()
export class ReportFilterInput {
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
export class StockLevelReportInput extends ReportFilterInput {
  @Field(() => StockStatus, { nullable: true })
  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus;

  @Field({ nullable: true })
  @IsOptional()
  includeZeroStock?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeLowStock?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeOverstock?: boolean;
}

@InputType()
export class MovementReportInput extends ReportFilterInput {
  @Field(() => MovementDirection, { nullable: true })
  @IsOptional()
  @IsEnum(MovementDirection)
  direction?: MovementDirection;

  @Field({ nullable: true })
  @IsOptional()
  movementType?: string;

  @Field({ nullable: true })
  @IsOptional()
  referenceType?: string;

  @Field({ nullable: true })
  @IsOptional()
  includeAdjustments?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeTransfers?: boolean;
}

@InputType()
export class AgingReportInput extends ReportFilterInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  agingDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  includeExpired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeNearExpiry?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  nearExpiryDays?: number;
}

@InputType()
export class TurnoverReportInput extends ReportFilterInput {
  @Field(() => TurnoverCategory, { nullable: true })
  @IsOptional()
  @IsEnum(TurnoverCategory)
  category?: TurnoverCategory;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  periodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  includeDeadStock?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  includeSlowMoving?: boolean;
}