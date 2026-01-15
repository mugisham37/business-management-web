import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * String filter operators
 */
export enum StringFilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

registerEnumType(StringFilterOperator, {
  name: 'StringFilterOperator',
  description: 'String comparison operators',
});

/**
 * Number filter operators
 */
export enum NumberFilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

registerEnumType(NumberFilterOperator, {
  name: 'NumberFilterOperator',
  description: 'Number comparison operators',
});

/**
 * Date filter operators
 */
export enum DateFilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  AFTER = 'AFTER',
  AFTER_OR_EQUAL = 'AFTER_OR_EQUAL',
  BEFORE = 'BEFORE',
  BEFORE_OR_EQUAL = 'BEFORE_OR_EQUAL',
  BETWEEN = 'BETWEEN',
}

registerEnumType(DateFilterOperator, {
  name: 'DateFilterOperator',
  description: 'Date comparison operators',
});

/**
 * String filter input
 */
@InputType()
export class StringFilter {
  @Field(() => StringFilterOperator, { nullable: true })
  @ApiProperty({ enum: StringFilterOperator, required: false })
  @IsOptional()
  @IsEnum(StringFilterOperator)
  operator?: StringFilterOperator;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

/**
 * Number filter input
 */
@InputType()
export class NumberFilter {
  @Field(() => NumberFilterOperator, { nullable: true })
  @ApiProperty({ enum: NumberFilterOperator, required: false })
  @IsOptional()
  @IsEnum(NumberFilterOperator)
  operator?: NumberFilterOperator;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  value?: number;

  @Field(() => [Number], { nullable: true })
  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  values?: number[];
}

/**
 * Date filter input
 */
@InputType()
export class DateFilter {
  @Field(() => DateFilterOperator, { nullable: true })
  @ApiProperty({ enum: DateFilterOperator, required: false })
  @IsOptional()
  @IsEnum(DateFilterOperator)
  operator?: DateFilterOperator;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  value?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

/**
 * Base filter input with common fields
 * Extend this for entity-specific filters
 */
@InputType({ isAbstract: true })
export abstract class BaseFilterInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Search across multiple fields', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => DateFilter, { nullable: true })
  @ApiProperty({ type: DateFilter, description: 'Filter by creation date', required: false })
  @IsOptional()
  createdAt?: DateFilter;

  @Field(() => DateFilter, { nullable: true })
  @ApiProperty({ type: DateFilter, description: 'Filter by update date', required: false })
  @IsOptional()
  updatedAt?: DateFilter;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], description: 'Filter by IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

/**
 * Example entity filter input
 * Use this as a template for creating entity-specific filters
 */
@InputType()
export class EntityFilterInput extends BaseFilterInput {
  @Field(() => StringFilter, { nullable: true })
  @ApiProperty({ type: StringFilter, description: 'Filter by name', required: false })
  @IsOptional()
  name?: StringFilter;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], description: 'Filter by status', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], description: 'Filter by tags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
