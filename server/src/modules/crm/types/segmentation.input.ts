import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SegmentRuleOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  IN = 'in',
  NOT_IN = 'not_in',
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

registerEnumType(SegmentRuleOperator, {
  name: 'SegmentRuleOperator',
});

registerEnumType(LogicalOperator, {
  name: 'LogicalOperator',
});

@InputType()
export class SegmentRuleInput {
  @Field()
  @IsString()
  field!: string;

  @Field(() => SegmentRuleOperator)
  @IsEnum(SegmentRuleOperator)
  operator!: SegmentRuleOperator;

  @Field()
  value!: any;

  @Field(() => LogicalOperator, { nullable: true })
  @IsOptional()
  @IsEnum(LogicalOperator)
  logicalOperator?: LogicalOperator;
}

@InputType()
export class CreateSegmentInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SegmentRuleInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleInput)
  rules!: SegmentRuleInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateSegmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SegmentRuleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleInput)
  rules?: SegmentRuleInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class SegmentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
