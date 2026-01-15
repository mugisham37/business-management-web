import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

/**
 * Sort order enum
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort order direction',
});

/**
 * Base sort input
 * Extend this for entity-specific sorting
 */
@InputType({ isAbstract: true })
export abstract class BaseSortInput {
  @Field()
  @ApiProperty({ description: 'Field to sort by' })
  @IsString()
  field!: string;

  @Field(() => SortOrder, { defaultValue: SortOrder.ASC })
  @ApiProperty({ enum: SortOrder, description: 'Sort order', default: SortOrder.ASC })
  @IsEnum(SortOrder)
  order!: SortOrder;
}

/**
 * Example entity sort input
 * Use this as a template for creating entity-specific sort inputs
 */
@InputType()
export class EntitySortInput extends BaseSortInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Secondary sort field', required: false })
  @IsOptional()
  @IsString()
  secondaryField?: string;

  @Field(() => SortOrder, { nullable: true })
  @ApiProperty({ enum: SortOrder, description: 'Secondary sort order', required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  secondaryOrder?: SortOrder;
}

/**
 * Common sort fields enum
 * Use this for validating sort field names
 */
export enum CommonSortField {
  ID = 'id',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

registerEnumType(CommonSortField, {
  name: 'CommonSortField',
  description: 'Common fields available for sorting',
});
