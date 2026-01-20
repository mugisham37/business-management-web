import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum PickListStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum PickListItemStatus {
  PENDING = 'pending',
  PICKING = 'picking',
  PICKED = 'picked',
  SHORT = 'short',
  SKIPPED = 'skipped',
}

export enum PickListPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PickingWaveStatus {
  PLANNING = 'planning',
  PLANNED = 'planned',
  RELEASED = 'released',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Alias for backward compatibility
export const WaveStatus = PickingWaveStatus;
export type WaveStatus = PickingWaveStatus;

export enum WaveType {
  STANDARD = 'standard',
  PRIORITY = 'priority',
  BATCH = 'batch',
  ZONE = 'zone',
}

export enum PickingStrategy {
  ZONE = 'zone',
  BATCH = 'batch',
  WAVE = 'wave',
  DISCRETE = 'discrete',
  CLUSTER = 'cluster',
}

// Pick List DTOs
export class CreatePickListDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  pickListNumber!: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsUUID()
  @IsOptional()
  waveId?: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  orderIds?: string[];

  @IsUUID()
  @IsOptional()
  assignedPickerId?: string;

  @IsEnum(PickListPriority)
  @IsOptional()
  priority?: PickListPriority;

  @IsEnum(PickListStatus)
  @IsOptional()
  status?: PickListStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentUsed?: string[];

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePickListItemDto)
  items?: CreatePickListItemDto[];
}

export class UpdatePickListDto {
  @IsUUID()
  @IsOptional()
  assignedPickerId?: string;

  @IsEnum(PickListPriority)
  @IsOptional()
  priority?: PickListPriority;

  @IsEnum(PickListStatus)
  @IsOptional()
  status?: PickListStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startedAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  completedAt?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  actualDistance?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  actualTime?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pickingAccuracy?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentUsed?: string[];

  @IsArray()
  @IsOptional()
  issues?: any[];
}

export class PickListQueryDto {
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
  waveId?: string;

  @IsUUID()
  @IsOptional()
  assignedPickerId?: string;

  @IsEnum(PickListStatus)
  @IsOptional()
  status?: PickListStatus;

  @IsEnum(PickListPriority)
  @IsOptional()
  priority?: PickListPriority;

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

// Pick List Item DTOs
export class CreatePickListItemDto {
  @IsUUID()
  @IsOptional()
  pickListId?: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsUUID()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsUUID()
  @IsOptional()
  binLocationId?: string;

  @IsUUID()
  @IsOptional()
  lotId?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiryDate?: Date;

  @IsNumber()
  @Min(0)
  requestedQuantity!: number;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  lineNumber?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pickingSequence?: number;

  @IsUUID()
  @IsOptional()
  orderLineId?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;
}

export class UpdatePickListItemDto {
  @IsUUID()
  @IsOptional()
  binLocationId?: string;

  @IsUUID()
  @IsOptional()
  lotId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pickedQuantity?: number;

  @IsEnum(PickListItemStatus)
  @IsOptional()
  status?: PickListItemStatus;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  pickedAt?: Date;

  @IsUUID()
  @IsOptional()
  pickedById?: string;

  @IsBoolean()
  @IsOptional()
  qualityCheck?: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  qualityNotes?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  shortPickReason?: string;

  @IsArray()
  @IsOptional()
  issues?: any[];
}

// Picking Wave DTOs
export class CreatePickingWaveDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  waveNumber!: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  zoneIds?: string[];

  @IsEnum(WaveType)
  @IsOptional()
  waveType?: WaveType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @IsEnum(PickingStrategy)
  @IsOptional()
  strategy?: PickingStrategy;

  @IsEnum(PickingWaveStatus)
  @IsOptional()
  status?: PickingWaveStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledEndTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedEndTime?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  maxPickers?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  pickListIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  orderIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedPickers?: string[];

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;
}

export class UpdatePickingWaveDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  zoneIds?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @IsEnum(PickingWaveStatus)
  @IsOptional()
  status?: PickingWaveStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledEndTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedEndTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  actualStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  actualEndTime?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  maxPickers?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  pickListIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedPickerIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedPickers?: string[];

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;
}

export class PickingWaveQueryDto {
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

  @IsEnum(PickingWaveStatus)
  @IsOptional()
  status?: PickingWaveStatus;

  @IsEnum(PickingStrategy)
  @IsOptional()
  strategy?: PickingStrategy;

  @IsEnum(WaveType)
  @IsOptional()
  waveType?: WaveType;

  @IsUUID()
  @IsOptional()
  assignedPickerId?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledDateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledDateTo?: Date;

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

// Route Optimization DTO
export class OptimizePickingRouteDto {
  @IsUUID()
  @IsNotEmpty()
  pickListId!: string;

  @IsString()
  @IsOptional()
  strategy?: 'shortest_distance' | 'zone_based' | 'fewest_aisles' | 'serpentine';

  @IsBoolean()
  @IsOptional()
  considerWeight?: boolean;

  @IsBoolean()
  @IsOptional()
  considerFragility?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDistancePerTrip?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeightPerTrip?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  priorityZones?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludeZones?: string[];
}

// Wave Planning DTO
export class WavePlanningDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  orderIds?: string[];

  @IsEnum(PickingStrategy)
  @IsOptional()
  strategy?: PickingStrategy;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  targetStartTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  targetEndTime?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxOrdersPerWave?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxPickersPerWave?: number;

  @IsBoolean()
  @IsOptional()
  groupByZone?: boolean;

  @IsBoolean()
  @IsOptional()
  groupByCarrier?: boolean;

  @IsBoolean()
  @IsOptional()
  prioritizeUrgent?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  preferredPickers?: string[];

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;
}
