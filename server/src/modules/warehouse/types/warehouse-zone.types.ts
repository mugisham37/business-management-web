import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, Min, Length, IsNotEmpty } from 'class-validator';

// Enums
export enum WarehouseZoneTypeEnum {
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

registerEnumType(WarehouseZoneTypeEnum, { name: 'WarehouseZoneTypeEnum' });
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

  @Field(() => WarehouseZoneTypeEnum)
  @ApiProperty({ description: 'Zone type', enum: WarehouseZoneTypeEnum })
  zoneType!: WarehouseZoneTypeEnum;

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

// Input Types
@InputType()
export class CreateWarehouseZoneInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  zoneCode!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => WarehouseZoneTypeEnum)
  @IsEnum(WarehouseZoneTypeEnum)
  zoneType!: WarehouseZoneTypeEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFootage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBinLocations?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  humidityControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  accessLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresAuthorization?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowMixedProducts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowMixedBatches?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  fifoEnforced?: boolean;
}

@InputType()
export class UpdateWarehouseZoneInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFootage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBinLocations?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  humidityControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  accessLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresAuthorization?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowMixedProducts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowMixedBatches?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  fifoEnforced?: boolean;

  @Field(() => ZoneStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;
}

@InputType()
export class WarehouseZoneFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => WarehouseZoneTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(WarehouseZoneTypeEnum)
  zoneType?: WarehouseZoneTypeEnum;

  @Field(() => ZoneStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;
}

// Connection Types
@ObjectType()
export class WarehouseZoneEdge extends Edge<WarehouseZoneType> {
  @Field(() => WarehouseZoneType)
  node!: WarehouseZoneType;
}

@ObjectType()
export class WarehouseZoneConnection extends Connection<WarehouseZoneType> {
  @Field(() => [WarehouseZoneEdge])
  edges!: WarehouseZoneEdge[];
}
