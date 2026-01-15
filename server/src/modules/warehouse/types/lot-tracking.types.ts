import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsUUID, 
  IsArray,
  IsInt,
  IsDate,
  Length,
  IsNotEmpty,
  Min,
} from 'class-validator';

// Enums
export enum QualityStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  QUARANTINE = 'quarantine',
}

export enum MovementType {
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
registerEnumType(MovementType, { name: 'MovementType' });
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

  @Field(() => Int)
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
}

@ObjectType('LotMovement')
export class LotMovementType {
  @Field(() => ID)
  @ApiProperty({ description: 'Movement ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Lot number' })
  lotNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field(() => MovementType)
  @ApiProperty({ description: 'Movement type', enum: MovementType })
  movementType!: MovementType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'From location', required: false })
  fromLocation?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'To location', required: false })
  toLocation?: string;

  @Field(() => Int)
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

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reason', required: false })
  reason?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}

@ObjectType('RecallInfo')
export class RecallInfoType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Recall ID' })
  recallId!: string;

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

  @Field(() => ID)
  @ApiProperty({ description: 'Initiated by user ID' })
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

  @Field(() => Int)
  @ApiProperty({ description: 'Affected quantity' })
  affectedQuantity!: number;

  @Field(() => Int)
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

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
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
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
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
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class CreateRecallInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  recallNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
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
  @Length(1, 500)
  reason!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  description!: string;

  @Field()
  @IsDate()
  effectiveDate!: Date;

  @Field()
  customerNotificationRequired!: boolean;

  @Field()
  regulatoryReportingRequired!: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  instructions!: string;
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
