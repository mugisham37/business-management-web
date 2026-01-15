import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsEnum, IsUUID, IsInt, IsNotEmpty, Min } from 'class-validator';

// Enums
export enum WaveStatus {
  PENDING = 'pending',
  RELEASED = 'released',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(WaveStatus, { name: 'WaveStatus' });

// Object Types
@ObjectType('PickingWave')
export class PickingWaveType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Wave ID' })
  waveId!: string;

  @Field()
  @ApiProperty({ description: 'Wave number' })
  waveNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => WaveStatus)
  @ApiProperty({ description: 'Status', enum: WaveStatus })
  status!: WaveStatus;

  @Field(() => Int)
  @ApiProperty({ description: 'Total orders' })
  totalOrders!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total pick lists' })
  totalPickLists!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Released at', required: false })
  releasedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Completed at', required: false })
  completedAt?: Date;
}

// Input Types
@InputType()
export class CreatePickingWaveInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  waveNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => [ID])
  @IsUUID('4', { each: true })
  orderIds!: string[];
}

// Connection Types
@ObjectType()
export class PickingWaveEdge extends Edge<PickingWaveType> {
  @Field(() => PickingWaveType)
  node!: PickingWaveType;
}

@ObjectType()
export class PickingWaveConnection extends Connection<PickingWaveType> {
  @Field(() => [PickingWaveEdge])
  edges!: PickingWaveEdge[];
}
