import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

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
