import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsEnum, IsUUID, IsInt, IsNotEmpty, Min } from 'class-validator';

// Enums
export enum PickListStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PickListPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

registerEnumType(PickListStatus, { name: 'PickListStatus' });
registerEnumType(PickListPriority, { name: 'PickListPriority' });

// Object Types
@ObjectType('PickList')
export class PickListType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Pick list ID' })
  pickListId!: string;

  @Field()
  @ApiProperty({ description: 'Pick list number' })
  pickListNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Wave ID', required: false })
  waveId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Assigned picker ID', required: false })
  assignedTo?: string;

  @Field(() => PickListStatus)
  @ApiProperty({ description: 'Status', enum: PickListStatus })
  status!: PickListStatus;

  @Field(() => PickListPriority)
  @ApiProperty({ description: 'Priority', enum: PickListPriority })
  priority!: PickListPriority;

  @Field(() => Int)
  @ApiProperty({ description: 'Total items' })
  totalItems!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Picked items' })
  pickedItems!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Started at', required: false })
  startedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Completed at', required: false })
  completedAt?: Date;
}

// Input Types
@InputType()
export class CreatePickListInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  pickListNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  waveId?: string;

  @Field(() => PickListPriority, { nullable: true })
  @IsOptional()
  @IsEnum(PickListPriority)
  priority?: PickListPriority;
}

@InputType()
export class UpdatePickListInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field(() => PickListStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PickListStatus)
  status?: PickListStatus;

  @Field(() => PickListPriority, { nullable: true })
  @IsOptional()
  @IsEnum(PickListPriority)
  priority?: PickListPriority;
}

@InputType()
export class RecordPickInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  pickedQuantity!: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  binLocationId?: string;
}

// Connection Types
@ObjectType()
export class PickListEdge extends Edge<PickListType> {
  @Field(() => PickListType)
  node!: PickListType;
}

@ObjectType()
export class PickListConnection extends Connection<PickListType> {
  @Field(() => [PickListEdge])
  edges!: PickListEdge[];
}
