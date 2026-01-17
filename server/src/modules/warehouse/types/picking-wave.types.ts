import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty } from 'class-validator';

// Enums
export enum WaveStatus {
  PLANNED = 'planned',
  RELEASED = 'released',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum WaveType {
  STANDARD = 'standard',
  PRIORITY = 'priority',
  BATCH = 'batch',
  ZONE = 'zone',
}

export enum WavePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

registerEnumType(WaveStatus, { name: 'WaveStatus' });
registerEnumType(WaveType, { name: 'WaveType' });
registerEnumType(WavePriority, { name: 'WavePriority' });

// Object Types
@ObjectType('PickingWave')
export class PickingWaveType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Wave number' })
  waveNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => WaveStatus)
  @ApiProperty({ description: 'Wave status', enum: WaveStatus })
  status!: WaveStatus;

  @Field(() => WaveType)
  @ApiProperty({ description: 'Wave type', enum: WaveType })
  waveType!: WaveType;

  @Field(() => WavePriority)
  @ApiProperty({ description: 'Wave priority', enum: WavePriority })
  priority!: WavePriority;

  @Field(() => Int)
  @ApiProperty({ description: 'Total orders' })
  totalOrders!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total items' })
  totalItems!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total pick lists' })
  totalPickLists!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Estimated pick time in minutes', required: false })
  estimatedPickTime?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Actual pick time in minutes', required: false })
  actualPickTime?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Picking accuracy percentage', required: false })
  pickingAccuracy?: number;

  @Field(() => [ID], { nullable: true })
  @ApiProperty({ description: 'Assigned picker IDs', type: [String], required: false })
  assignedPickers?: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Planned start date', required: false })
  plannedStartDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Actual start date', required: false })
  actualStartDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Planned completion date', required: false })
  plannedCompletionDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Actual completion date', required: false })
  actualCompletionDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Wave notes', required: false })
  notes?: string;
}

@ObjectType('WaveStatistics')
export class WaveStatisticsType {
  @Field(() => ID)
  @ApiProperty({ description: 'Wave ID' })
  waveId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Picking efficiency' })
  pickingEfficiency!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Average pick time per item' })
  averagePickTimePerItem!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Items picked' })
  itemsPicked!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Items remaining' })
  itemsRemaining!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Accuracy rate' })
  accuracyRate!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Active pickers' })
  activePickers!: number;
}

@ObjectType('WaveRecommendation')
export class WaveRecommendationType {
  @Field()
  @ApiProperty({ description: 'Recommendation type' })
  type!: string;

  @Field()
  @ApiProperty({ description: 'Recommendation message' })
  message!: string;

  @Field()
  @ApiProperty({ description: 'Priority level' })
  priority!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Action required', required: false })
  actionRequired?: string;
}

// Input Types
@InputType()
export class CreatePickingWaveInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  waveNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => WaveType)
  @IsEnum(WaveType)
  waveType!: WaveType;

  @Field(() => WavePriority, { nullable: true })
  @IsOptional()
  @IsEnum(WavePriority)
  priority?: WavePriority;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  orderIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  assignedPickers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  plannedStartDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  plannedCompletionDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class UpdatePickingWaveInput {
  @Field(() => WaveStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WaveStatus)
  status?: WaveStatus;

  @Field(() => WavePriority, { nullable: true })
  @IsOptional()
  @IsEnum(WavePriority)
  priority?: WavePriority;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  assignedPickers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  plannedStartDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  plannedCompletionDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class PickingWaveFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => WaveStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WaveStatus)
  status?: WaveStatus;

  @Field(() => WaveType, { nullable: true })
  @IsOptional()
  @IsEnum(WaveType)
  waveType?: WaveType;

  @Field(() => WavePriority, { nullable: true })
  @IsOptional()
  @IsEnum(WavePriority)
  priority?: WavePriority;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedPicker?: string;
}

@InputType()
export class WavePlanningInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => [ID])
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  orderIds!: string[];

  @Field(() => WaveType, { nullable: true })
  @IsOptional()
  @IsEnum(WaveType)
  waveType?: WaveType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxWaves?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  optimizeForDistance?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  optimizeForTime?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  groupByZone?: boolean;
}

@InputType()
export class AssignPickersInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  pickerIds!: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoBalance?: boolean;
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