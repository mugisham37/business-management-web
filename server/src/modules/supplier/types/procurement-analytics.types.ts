import { ObjectType, Field, Float, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

// Object Types
@ObjectType('SupplierPerformanceMetrics')
export class SupplierPerformanceMetricsType {
  @Field()
  supplierId!: string;

  @Field()
  supplierName!: string;

  @Field(() => Float)
  overallScore!: number;

  @Field(() => Float)
  qualityScore!: number;

  @Field(() => Float)
  deliveryScore!: number;

  @Field(() => Float)
  serviceScore!: number;

  @Field(() => Float)
  onTimeDeliveryRate!: number;

  @Field(() => Float)
  qualityDefectRate!: number;

  @Field(() => Float)
  averageResponseTime!: number;

  @Field()
  totalOrders!: number;

  @Field(() => Float)
  totalSpend!: number;

  @Field(() => Float)
  averageOrderValue!: number;

  @Field({ nullable: true })
  lastEvaluationDate?: Date;

  @Field()
  trend!: string;
}

@ObjectType('SpendBySupplier')
export class SpendBySupplierType {
  @Field()
  supplierId!: string;

  @Field()
  supplierName!: string;

  @Field(() => Float)
  totalSpend!: number;

  @Field(() => Float)
  percentage!: number;

  @Field()
  orderCount!: number;

  @Field(() => Float)
  averageOrderValue!: number;
}

@ObjectType('SpendAnalysis')
export class SpendAnalysisType {
  @Field(() => Float)
  totalSpend!: number;

  @Field(() => [SpendBySupplierType])
  spendBySupplier!: SpendBySupplierType[];

  @Field(() => [SpendBySupplierType])
  topSuppliers!: SpendBySupplierType[];
}

@ObjectType('CostTrend')
export class CostTrendType {
  @Field()
  period!: string;

  @Field(() => Float)
  totalCost!: number;

  @Field()
  orderCount!: number;

  @Field(() => Float)
  averageOrderValue!: number;
}

@ObjectType('LeadTimeAnalysis')
export class LeadTimeAnalysisType {
  @Field()
  supplierId!: string;

  @Field()
  supplierName!: string;

  @Field(() => Float)
  averageLeadTime!: number;

  @Field(() => Float)
  minLeadTime!: number;

  @Field(() => Float)
  maxLeadTime!: number;

  @Field(() => Float)
  onTimeDeliveryPercentage!: number;
}

// Input Types
@InputType()
export class AnalyticsDateRangeInput {
  @Field()
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @Field()
  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
