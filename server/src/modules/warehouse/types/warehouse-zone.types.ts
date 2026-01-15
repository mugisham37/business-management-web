import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, Min, Length, IsNotEmpty } from 'class-validator';

// Enums
export enum WarehouseZoneType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  QUARANTINE = 'quarantine',
  STAGING = 'staging',
  CROSS_DOCK = 'cross_dock',
  OFFICE = 'office',
  MAINTENANCE = 'maintenance',
}

export enum ZoneStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

registerEnumType(WarehouseZoneType, { name: 'WarehouseZoneType' });
registerEnumType(ZoneStatus, { name: 'ZoneStatus' });

// Object Type
@ObjectType('WarehouseZone')
export class WarehouseZoneType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field()
  @ApiProperty({ description: 'Zone code' })
  zoneCode!: string;

  @Field()
  @ApiProperty({ description: 'Zone name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Zone description', required: false })
  description?: string;

  @Field(() => WarehouseZoneType)
  @ApiProperty({ description: 'Zone type', enum: WarehouseZoneType })
  zoneType!: WarehouseZoneType;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Priority level', required: false })
  priority?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Square footage', required: false })
  squareFootage?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Maximum bin locations', required: false })
  maxBinLocations?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Current bin locations', required: false })
  currentBinLocations?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Temperature controlled', required: false })
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Humidity controlled', required: false })
  humidityControlled?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Access level', required: false })
  accessLevel?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Requires authorization', required: false })
  requiresAuthorization?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Allow mixed products', required: false })
  allowMixedProducts?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Allow mixed batches', required: false })
  allowMixedBatches?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'FIFO enforced', required: false })
  fifoEnforced?: boolean;

  @Field(() => ZoneStatus)
  @ApiProperty({ description: 'Zone status', enum: ZoneStatus })
  status!: ZoneStatus;
}
