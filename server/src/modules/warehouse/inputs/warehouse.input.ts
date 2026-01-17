import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty } from 'class-validator';
import { WarehouseStatus, LayoutType, SecurityLevel } from '../types/warehouse.types';

@InputType()
export class InitializeWarehouseInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  createDefaultZones?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  createSampleBinLocations?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sampleBinCount?: number;
}

@InputType()
export class WarehouseCapacityInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalCapacity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  usedCapacity!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  totalBinLocations!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  occupiedBinLocations!: number;
}

@InputType()
export class UpdateWarehouseCapacityInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCapacityUnits?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentCapacityUnits?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBinLocations?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  occupiedBinLocations?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  changeReason?: string;
}

@InputType()
export class WarehouseConfigurationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  wmsIntegration?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  barcodeSystem?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  rfidEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  automatedSorting?: boolean;

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
  @IsBoolean()
  accessControlRequired?: boolean;

  @Field(() => SecurityLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SecurityLevel)
  securityLevel?: SecurityLevel;
}

@InputType()
export class WarehouseOperatingHoursInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  dayOfWeek!: string; // monday, tuesday, etc.

  @Field()
  @IsString()
  @IsNotEmpty()
  openTime!: string; // HH:MM format

  @Field()
  @IsString()
  @IsNotEmpty()
  closeTime!: string; // HH:MM format

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

@InputType()
export class UpdateWarehouseOperatingHoursInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => [WarehouseOperatingHoursInput])
  @IsArray()
  @IsNotEmpty()
  operatingHours!: WarehouseOperatingHoursInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  timezone?: string;
}

@InputType()
export class WarehouseLayoutOptimizationInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => LayoutType)
  @IsEnum(LayoutType)
  targetLayoutType!: LayoutType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  optimizeForPicking?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  optimizeForStorage?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  minimizeTravel?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  maximizeCapacity?: boolean;
}

@InputType()
export class WarehousePerformanceMetricsInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pickingAccuracy?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averagePickTime?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  throughputPerHour?: number;
}

@InputType()
export class WarehouseSortInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warehouseCode?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdAt?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  totalCapacity?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utilizationPercentage?: 'ASC' | 'DESC';
}