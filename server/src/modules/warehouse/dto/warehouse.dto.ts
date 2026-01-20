import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export enum BinLocationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  BLOCKED = 'blocked',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
}

export enum WarehouseZoneType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  STAGING = 'staging',
  QUARANTINE = 'quarantine',
  RETURNS = 'returns',
  COLD_STORAGE = 'cold_storage',
  HAZMAT = 'hazmat',
}

export enum LayoutType {
  GRID = 'grid',
  FREEFORM = 'freeform',
  HYBRID = 'hybrid',
}

export enum SecurityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  MAXIMUM = 'maximum',
}

// Warehouse DTOs
export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  warehouseCode!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  locationId!: string;

  @IsUUID()
  @IsOptional()
  warehouseManagerId?: string;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalCapacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalSquareFootage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  storageSquareFootage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ceilingHeight?: number;

  @IsEnum(LayoutType)
  @IsOptional()
  layoutType?: LayoutType;

  @IsObject()
  @IsOptional()
  aisleConfiguration?: Record<string, any>;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsObject()
  @IsOptional()
  temperatureRange?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  humidityControlled?: boolean;

  @IsObject()
  @IsOptional()
  humidityRange?: Record<string, any>;

  @IsEnum(SecurityLevel)
  @IsOptional()
  securityLevel?: SecurityLevel;

  @IsBoolean()
  @IsOptional()
  accessControlRequired?: boolean;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsObject()
  @IsOptional()
  integrationSettings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  operatingHours?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsUUID()
  @IsOptional()
  warehouseManagerId?: string;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalCapacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsObject()
  @IsOptional()
  operatingHours?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class WarehouseQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class WarehouseCapacityDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsNumber()
  @Min(0)
  totalCapacity!: number;

  @IsNumber()
  @Min(0)
  usedCapacity!: number;

  @IsNumber()
  @Min(0)
  availableCapacity!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  utilizationPercentage!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalBinLocations?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  occupiedBinLocations?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  availableBinLocations?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;
}

// Warehouse Zone DTOs
export class CreateWarehouseZoneDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  zoneCode!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsEnum(WarehouseZoneType)
  @IsNotEmpty()
  zoneType!: WarehouseZoneType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @IsObject()
  @IsOptional()
  coordinates?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  squareFootage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxBinLocations?: number;

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsObject()
  @IsOptional()
  temperatureRange?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  humidityControlled?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMixedProducts?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMixedBatches?: boolean;

  @IsBoolean()
  @IsOptional()
  fifoEnforced?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresAuthorization?: boolean;

  @IsString()
  @IsOptional()
  accessLevel?: string;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdateWarehouseZoneDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsEnum(WarehouseZoneType)
  @IsOptional()
  zoneType?: WarehouseZoneType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresAuthorization?: boolean;

  @IsString()
  @IsOptional()
  accessLevel?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class WarehouseZoneQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsEnum(WarehouseZoneType)
  @IsOptional()
  zoneType?: WarehouseZoneType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

// Bin Location DTOs
export class CreateBinLocationDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  binCode!: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  displayName?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsString()
  @IsOptional()
  aisle?: string;

  @IsString()
  @IsOptional()
  bay?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  xCoordinate?: number;

  @IsNumber()
  @IsOptional()
  yCoordinate?: number;

  @IsNumber()
  @IsOptional()
  zCoordinate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCapacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accessEquipment?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedProductTypes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  restrictedProductTypes?: string[];

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsObject()
  @IsOptional()
  temperatureRange?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hazmatApproved?: boolean;

  @IsNumber()
  @IsOptional()
  pickingSequence?: number;

  @IsUUID()
  @IsOptional()
  assignedProductId?: string;

  @IsUUID()
  @IsOptional()
  assignedVariantId?: string;

  @IsBoolean()
  @IsOptional()
  dedicatedProduct?: boolean;

  @IsEnum(BinLocationStatus)
  @IsOptional()
  status?: BinLocationStatus;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, number>;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBinLocationDto {
  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  displayName?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsString()
  @IsOptional()
  aisle?: string;

  @IsString()
  @IsOptional()
  bay?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  xCoordinate?: number;

  @IsNumber()
  @IsOptional()
  yCoordinate?: number;

  @IsNumber()
  @IsOptional()
  zCoordinate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCapacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accessEquipment?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedProductTypes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  restrictedProductTypes?: string[];

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsObject()
  @IsOptional()
  temperatureRange?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hazmatApproved?: boolean;

  @IsNumber()
  @IsOptional()
  pickingSequence?: number;

  @IsUUID()
  @IsOptional()
  assignedProductId?: string;

  @IsUUID()
  @IsOptional()
  assignedVariantId?: string;

  @IsBoolean()
  @IsOptional()
  dedicatedProduct?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  occupancyPercentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  currentWeight?: number;

  @IsEnum(BinLocationStatus)
  @IsOptional()
  status?: BinLocationStatus;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, number>;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class BinLocationQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsEnum(BinLocationStatus)
  @IsOptional()
  status?: BinLocationStatus;

  @IsString()
  @IsOptional()
  aisle?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsUUID()
  @IsOptional()
  assignedProductId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class BulkBinLocationDimensionsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;
}

export class BulkCreateBinLocationsDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  aisleCount?: number;

  @IsString()
  @IsOptional()
  aislePrefix?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  bayCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  levelCount?: number;

  @IsObject()
  @IsOptional()
  @Type(() => BulkBinLocationDimensionsDto)
  dimensions?: BulkBinLocationDimensionsDto;

  @IsObject()
  @IsOptional()
  defaultConfiguration?: Record<string, any>;

  @IsArray()
  @Type(() => CreateBinLocationDto)
  @IsOptional()
  binLocations?: CreateBinLocationDto[];
}
