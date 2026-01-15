import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from '../../../common/graphql/base.types';

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

@ObjectType()
@InputType('SegmentRuleInput')
export class SegmentRuleType {
  @Field()
  @ApiProperty()
  @IsString()
  field!: string;

  @Field(() => SegmentRuleOperator)
  @ApiProperty({ enum: SegmentRuleOperator })
  @IsEnum(SegmentRuleOperator)
  operator!: SegmentRuleOperator;

  @Field()
  @ApiProperty()
  value!: any;

  @Field(() => LogicalOperator, { nullable: true })
  @ApiProperty({ enum: LogicalOperator, required: false })
  @IsOptional()
  @IsEnum(LogicalOperator)
  logicalOperator?: LogicalOperator;
}

@ObjectType()
export class SegmentType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field()
  @ApiProperty()
  tenantId!: string;

  @Field()
  @ApiProperty()
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  description?: string;

  @Field(() => [SegmentRuleType])
  @ApiProperty({ type: [SegmentRuleType] })
  rules!: SegmentRuleType[];

  @Field()
  @ApiProperty()
  isActive!: boolean;

  @Field(() => Int)
  @ApiProperty()
  memberCount!: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  lastCalculatedAt?: Date;

  @Field()
  @ApiProperty()
  createdAt!: Date;

  @Field()
  @ApiProperty()
  updatedAt!: Date;
}

@InputType()
export class CreateSegmentInput {
  @Field()
  @ApiProperty()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SegmentRuleType])
  @ApiProperty({ type: [SegmentRuleType] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleType)
  rules!: SegmentRuleType[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateSegmentInput {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SegmentRuleType], { nullable: true })
  @ApiProperty({ type: [SegmentRuleType], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleType)
  rules?: SegmentRuleType[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ObjectType()
export class SegmentMemberType {
  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field()
  @ApiProperty()
  customerName!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  email?: string;

  @Field()
  @ApiProperty()
  addedAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  matchScore?: number;
}

@ObjectType()
export class SegmentJobResponseType {
  @Field()
  @ApiProperty()
  jobId!: string;
}
