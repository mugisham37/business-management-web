import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, Min, Max, Length, IsNotEmpty } from 'class-validator';

// Enums
export enum BinLocationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
}

registerEnumType(BinLocationStatus, { name: 'BinLocationStatus' });

// Object Type
@ObjectType('BinLocation')
export class BinLocationType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Zone ID' })
  zoneId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field()
  @ApiProperty({ description: 'Bin code' })
  binCode!: string;

  @Field()
  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Aisle', required: false })
  aisle?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Bay', required: false })
  bay?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Level', required: false })
  level?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Position', required: false })
  position?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'X coordinate', required: false })
  xCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Y coordinate', required: false })
  yCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Z coordinate', required: false })
  zCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Length', required: false })
  length?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Width', required: false })
  width?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Height', required: false })
  height?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Volume', required: false })
  volume?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Maximum weight', required: false })
  maxWeight?: number;

  @Field(() => BinLocationStatus)
  @ApiProperty({ description: 'Bin status', enum: BinLocationStatus })
  status!: BinLocationStatus;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Occupancy percentage', required: false })
  occupancyPercentage?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Current weight', required: false })
  currentWeight?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Allowed product types', type: [String], required: false })
  allowedProductTypes?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Restricted product types', type: [String], required: false })
  restrictedProductTypes?: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Temperature controlled', required: false })
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Hazmat approved', required: false })
  hazmatApproved?: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Picking sequence', required: false })
  pickingSequence?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Access equipment required', type: [String], required: false })
  accessEquipment?: string[];

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Assigned product ID', required: false })
  assignedProductId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Assigned variant ID', required: false })
  assignedVariantId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Dedicated product bin', required: false })
  dedicatedProduct?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last activity timestamp', required: false })
  lastActivityAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last pick timestamp', required: false })
  lastPickAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last replenish timestamp', required: false })
  lastReplenishAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}

// Input Types
@InputType()
export class CreateBinLocationInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  zoneId!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  binCode!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  displayName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  aisle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  bay?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  level?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  position?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  xCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  yCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  zCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedProductTypes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedProductTypes?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hazmatApproved?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pickingSequence?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessEquipment?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedProductId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedVariantId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  dedicatedProduct?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class UpdateBinLocationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  aisle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  bay?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  level?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  position?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  xCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  yCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  zCoordinate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @Field(() => BinLocationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BinLocationStatus)
  status?: BinLocationStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  occupancyPercentage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentWeight?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedProductTypes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedProductTypes?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hazmatApproved?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pickingSequence?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessEquipment?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedProductId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedVariantId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  dedicatedProduct?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class BinLocationFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @Field(() => BinLocationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BinLocationStatus)
  status?: BinLocationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  aisle?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedProductId?: string;
}

@InputType()
export class BulkCreateBinLocationsInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  zoneId!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 5)
  aislePrefix!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(50)
  aisleCount!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(100)
  bayCount!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(20)
  levelCount!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;
}

// Connection Types
@ObjectType()
export class BinLocationEdge extends Edge<BinLocationType> {
  @Field(() => BinLocationType)
  node!: BinLocationType;
}

@ObjectType()
export class BinLocationConnection extends Connection<BinLocationType> {
  @Field(() => [BinLocationEdge])
  edges!: BinLocationEdge[];
}
