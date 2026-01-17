import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsEnum, 
  IsUUID, 
  IsObject,
  Min,
  Max,
  Length,
  IsNotEmpty,
} from 'class-validator';

// Enums
export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

export enum LayoutType {
  GRID = 'grid',
  FLOW = 'flow',
  HYBRID = 'hybrid',
}

export enum SecurityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  MAXIMUM = 'maximum',
}

registerEnumType(WarehouseStatus, { name: 'WarehouseStatus' });
registerEnumType(LayoutType, { name: 'LayoutType' });
registerEnumType(SecurityLevel, { name: 'SecurityLevel' });

// Object Types
@ObjectType('WarehouseCapacity')
export class WarehouseCapacityType {
  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Total capacity units' })
  totalCapacity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Used capacity units' })
  usedCapacity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Available capacity units' })
  availableCapacity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Capacity utilization percentage' })
  utilizationPercentage!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total bin locations' })
  totalBinLocations!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Occupied bin locations' })
  occupiedBinLocations!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Available bin locations' })
  availableBinLocations!: number;
}

@ObjectType('Warehouse')
export class WarehouseType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Location ID reference' })
  locationId!: string;

  @Field()
  @ApiProperty({ description: 'Warehouse code' })
  warehouseCode!: string;

  @Field()
  @ApiProperty({ description: 'Warehouse name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Warehouse description', required: false })
  description?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Total square footage', required: false })
  totalSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Storage square footage', required: false })
  storageSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Ceiling height in feet', required: false })
  ceilingHeight?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Total bin locations', required: false })
  totalBinLocations?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Occupied bin locations', required: false })
  occupiedBinLocations?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Maximum capacity in units', required: false })
  maxCapacityUnits?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Current capacity in units', required: false })
  currentCapacityUnits?: number;

  @Field(() => LayoutType, { nullable: true })
  @ApiProperty({ description: 'Layout type', enum: LayoutType, required: false })
  layoutType?: LayoutType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Timezone', required: false })
  timezone?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Temperature controlled', required: false })
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Humidity controlled', required: false })
  humidityControlled?: boolean;

  @Field(() => SecurityLevel, { nullable: true })
  @ApiProperty({ description: 'Security level', enum: SecurityLevel, required: false })
  securityLevel?: SecurityLevel;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Access control required', required: false })
  accessControlRequired?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'WMS integration enabled', required: false })
  wmsIntegration?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Barcode system enabled', required: false })
  barcodeSystem?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'RFID enabled', required: false })
  rfidEnabled?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Automated sorting enabled', required: false })
  automatedSorting?: boolean;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Picking accuracy percentage', required: false })
  pickingAccuracy?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Average pick time in minutes', required: false })
  averagePickTime?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Throughput per hour', required: false })
  throughputPerHour?: number;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Warehouse manager ID', required: false })
  warehouseManagerId?: string;

  @Field(() => WarehouseStatus)
  @ApiProperty({ description: 'Warehouse status', enum: WarehouseStatus })
  status!: WarehouseStatus;
}

// Input Types
@InputType()
export class CreateWarehouseInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  locationId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  warehouseCode!: string;

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

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  storageSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ceilingHeight?: number;

  @Field(() => LayoutType, { nullable: true })
  @IsOptional()
  @IsEnum(LayoutType)
  layoutType?: LayoutType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  humidityControlled?: boolean;

  @Field(() => SecurityLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SecurityLevel)
  securityLevel?: SecurityLevel;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  accessControlRequired?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseManagerId?: string;
}

@InputType()
export class UpdateWarehouseInput {
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

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  storageSquareFootage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ceilingHeight?: number;

  @Field(() => LayoutType, { nullable: true })
  @IsOptional()
  @IsEnum(LayoutType)
  layoutType?: LayoutType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  humidityControlled?: boolean;

  @Field(() => SecurityLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SecurityLevel)
  securityLevel?: SecurityLevel;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  accessControlRequired?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseManagerId?: string;

  @Field(() => WarehouseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}

@InputType()
export class WarehouseFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => WarehouseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;
}

// Connection Types
@ObjectType()
export class WarehouseEdge extends Edge<WarehouseType> {
  @Field(() => WarehouseType)
  node!: WarehouseType;
}

@ObjectType()
export class WarehouseConnection extends Connection<WarehouseType> {
  @Field(() => [WarehouseEdge])
  edges!: WarehouseEdge[];
}
