import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty, IsObject } from 'class-validator';

// Enums
export enum QualityStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  QUARANTINE = 'quarantine',
}

export enum RotationType {
  FIFO = 'FIFO',
  FEFO = 'FEFO',
  LIFO = 'LIFO',
  MANUAL = 'MANUAL',
}

export enum LotMovementType {
  RECEIVE = 'receive',
  PICK = 'pick',
  ADJUST = 'adjust',
  TRANSFER = 'transfer',
  EXPIRE = 'expire',
  RECALL = 'recall',
}

export enum RecallType {
  VOLUNTARY = 'voluntary',
  MANDATORY = 'mandatory',
  PRECAUTIONARY = 'precautionary',
}

export enum RecallSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RecallStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(QualityStatus, { name: 'QualityStatus' });
registerEnumType(RotationType, { name: 'RotationType' });
registerEnumType(LotMovementType, { name: 'LotMovementType' });
registerEnumType(RecallType, { name: 'RecallType' });
registerEnumType(RecallSeverity, { name: 'RecallSeverity' });
registerEnumType(RecallStatus, { name: 'RecallStatus' });

// Object Types
@ObjectType('LotInfo')
export class LotInfoType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Lot number' })
  lotNumber!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Batch number', required: false })
  batchNumber?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Bin location ID', required: false })
  binLocationId?: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity' })
  quantity!: number;

  @Field()
  @ApiProperty({ description: 'Unit of measure' })
  unitOfMeasure!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Manufacture date', required: false })
  manufactureDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Expiry date', required: false })
  expiryDate?: Date;

  @Field()
  @ApiProperty({ description: 'Received date' })
  receivedDate!: Date;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Supplier ID', required: false })
  supplierId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Supplier lot number', required: false })
  supplierLotNumber?: string;

  @Field(() => QualityStatus)
  @ApiProperty({ description: 'Quality status', enum: QualityStatus })
  qualityStatus!: QualityStatus;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Certification number', required: false })
  certificationNumber?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Days until expiry', required: false })
  daysUntilExpiry?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Is expired', required: false })
  isExpired?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Is near expiry', required: false })
  isNearExpiry?: boolean;
}

@ObjectType('FIFORule')
export class FIFORuleType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Warehouse ID', required: false })
  warehouseId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Zone ID', required: false })
  zoneId?: string;

  @Field(() => RotationType)
  @ApiProperty({ description: 'Rotation type', enum: RotationType })
  rotationType!: RotationType;

  @Field()
  @ApiProperty({ description: 'Enforce strict rotation' })
  enforceStrict!: boolean;

  @Field()
  @ApiProperty({ description: 'Allow mixed lots' })
  allowMixedLots!: boolean;

  @Field(() => Int)
  @ApiProperty({ description: 'Expiry warning days' })
  expiryWarningDays!: number;

  @Field()
  @ApiProperty({ description: 'Auto quarantine expired' })
  autoQuarantineExpired!: boolean;

  @Field()
  @ApiProperty({ description: 'Require lot tracking' })
  requireLotTracking!: boolean;
}

@ObjectType('LotMovement')
export class LotMovementItemType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Lot number' })
  lotNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => LotMovementType)
  @ApiProperty({ description: 'Movement type', enum: LotMovementType })
  movementType!: LotMovementType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'From location', required: false })
  fromLocation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'To location', required: false })
  toLocation?: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity' })
  quantity!: number;

  @Field()
  @ApiProperty({ description: 'Unit of measure' })
  unitOfMeasure!: string;

  @Field()
  @ApiProperty({ description: 'Movement date' })
  movementDate!: Date;

  @Field(() => ID)
  @ApiProperty({ description: 'User ID' })
  userId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Order ID', required: false })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Pick list ID', required: false })
  pickListId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reason', required: false })
  reason?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}

@ObjectType('RecallInfo')
export class RecallInfoType extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Recall number' })
  recallNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Lot numbers', type: [String] })
  lotNumbers!: string[];

  @Field(() => RecallType)
  @ApiProperty({ description: 'Recall type', enum: RecallType })
  recallType!: RecallType;

  @Field(() => RecallSeverity)
  @ApiProperty({ description: 'Severity', enum: RecallSeverity })
  severity!: RecallSeverity;

  @Field()
  @ApiProperty({ description: 'Reason' })
  reason!: string;

  @Field()
  @ApiProperty({ description: 'Description' })
  description!: string;

  @Field()
  @ApiProperty({ description: 'Initiated by' })
  initiatedBy!: string;

  @Field()
  @ApiProperty({ description: 'Initiated date' })
  initiatedDate!: Date;

  @Field()
  @ApiProperty({ description: 'Effective date' })
  effectiveDate!: Date;

  @Field(() => RecallStatus)
  @ApiProperty({ description: 'Status', enum: RecallStatus })
  status!: RecallStatus;

  @Field(() => Float)
  @ApiProperty({ description: 'Affected quantity' })
  affectedQuantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Recovered quantity' })
  recoveredQuantity!: number;

  @Field()
  @ApiProperty({ description: 'Customer notification required' })
  customerNotificationRequired!: boolean;

  @Field()
  @ApiProperty({ description: 'Regulatory reporting required' })
  regulatoryReportingRequired!: boolean;

  @Field()
  @ApiProperty({ description: 'Instructions' })
  instructions!: string;
}

@ObjectType('LotTraceability')
export class LotTraceabilityType {
  @Field()
  @ApiProperty({ description: 'Lot number' })
  lotNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => [LotMovementItemType])
  @ApiProperty({ description: 'Movement history', type: [LotMovementItemType] })
  movementHistory!: LotMovementItemType[];

  @Field(() => [String])
  @ApiProperty({ description: 'Current locations', type: [String] })
  currentLocations!: string[];

  @Field(() => Float)
  @ApiProperty({ description: 'Current quantity' })
  currentQuantity!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Associated orders', type: [String] })
  associatedOrders!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Associated customers', type: [String] })
  associatedCustomers!: string[];
}

// Input Types
@InputType()
export class CreateLotInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lotNumber!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  batchNumber?: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  binLocationId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  unitOfMeasure!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  manufactureDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiryDate?: Date;

  @Field()
  @IsDate()
  receivedDate!: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  supplierLotNumber?: string;

  @Field(() => QualityStatus, { nullable: true })
  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  certificationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class UpdateLotInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  binLocationId?: string;

  @Field(() => QualityStatus, { nullable: true })
  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  certificationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class CreateFIFORuleInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @Field(() => RotationType)
  @IsEnum(RotationType)
  rotationType!: RotationType;

  @Field()
  @IsBoolean()
  enforceStrict!: boolean;

  @Field()
  @IsBoolean()
  allowMixedLots!: boolean;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(365)
  expiryWarningDays!: number;

  @Field()
  @IsBoolean()
  autoQuarantineExpired!: boolean;

  @Field()
  @IsBoolean()
  requireLotTracking!: boolean;
}

@InputType()
export class CreateRecallInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  recallNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  lotNumbers!: string[];

  @Field(() => RecallType)
  @IsEnum(RecallType)
  recallType!: RecallType;

  @Field(() => RecallSeverity)
  @IsEnum(RecallSeverity)
  severity!: RecallSeverity;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  reason!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description!: string;

  @Field()
  @IsDate()
  effectiveDate!: Date;

  @Field()
  @IsBoolean()
  customerNotificationRequired!: boolean;

  @Field()
  @IsBoolean()
  regulatoryReportingRequired!: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  instructions!: string;
}

@InputType()
export class RecordLotMovementInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field(() => LotMovementType)
  @IsEnum(LotMovementType)
  movementType!: LotMovementType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fromLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  toLocation?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  pickListId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class LotFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Field(() => QualityStatus, { nullable: true })
  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  expiredOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  nearExpiryOnly?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryWithinDays?: number;
}

// Connection Types
@ObjectType()
export class LotInfoEdge extends Edge<LotInfoType> {
  @Field(() => LotInfoType)
  node!: LotInfoType;
}

@ObjectType()
export class LotInfoConnection extends Connection<LotInfoType> {
  @Field(() => [LotInfoEdge])
  edges!: LotInfoEdge[];
}

@ObjectType()
export class RecallInfoEdge extends Edge<RecallInfoType> {
  @Field(() => RecallInfoType)
  node!: RecallInfoType;
}

@ObjectType()
export class RecallInfoConnection extends Connection<RecallInfoType> {
  @Field(() => [RecallInfoEdge])
  edges!: RecallInfoEdge[];
}