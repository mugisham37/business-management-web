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
  IsArray,
  IsObject,
  Min,
  Max,
  Length,
  IsNotEmpty,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum KitType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  CONFIGURABLE = 'configurable',
}

export enum SkillLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum WorkOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ComponentStatus {
  PENDING = 'pending',
  ALLOCATED = 'allocated',
  CONSUMED = 'consumed',
  SHORTAGE = 'shortage',
}

export enum CostCalculation {
  SUM_OF_PARTS = 'sum_of_parts',
  FIXED_PRICE = 'fixed_price',
  MARKUP_PERCENTAGE = 'markup_percentage',
}

registerEnumType(KitType, { name: 'KitType' });
registerEnumType(SkillLevel, { name: 'SkillLevel' });
registerEnumType(WorkOrderStatus, { name: 'WorkOrderStatus' });
registerEnumType(WorkOrderPriority, { name: 'WorkOrderPriority' });
registerEnumType(ComponentStatus, { name: 'ComponentStatus' });
registerEnumType(CostCalculation, { name: 'CostCalculation' });

// Object Types
@ObjectType('KitComponent')
export class KitComponentType {
  @Field(() => ID)
  @ApiProperty({ description: 'Component ID' })
  componentId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field()
  @ApiProperty({ description: 'SKU' })
  sku!: string;

  @Field()
  @ApiProperty({ description: 'Component name' })
  name!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Quantity required' })
  quantity!: number;

  @Field()
  @ApiProperty({ description: 'Unit of measure' })
  unitOfMeasure!: string;

  @Field()
  @ApiProperty({ description: 'Is optional' })
  isOptional!: boolean;

  @Field()
  @ApiProperty({ description: 'Is substitutable' })
  isSubstitutable!: boolean;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Substitute product IDs', type: [String], required: false })
  substitutes?: string[];

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Assembly position', required: false })
  position?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;
}

@ObjectType('KitDefinition')
export class KitDefinitionType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Kit ID' })
  kitId!: string;

  @Field()
  @ApiProperty({ description: 'Kit SKU' })
  kitSku!: string;

  @Field()
  @ApiProperty({ description: 'Kit name' })
  kitName!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @Field(() => KitType)
  @ApiProperty({ description: 'Kit type', enum: KitType })
  kitType!: KitType;

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  @Field(() => [KitComponentType])
  @ApiProperty({ description: 'Components', type: [KitComponentType] })
  components!: KitComponentType[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Assembly instructions', required: false })
  assemblyInstructions?: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Assembly time in minutes', required: false })
  assemblyTime?: number;

  @Field(() => SkillLevel)
  @ApiProperty({ description: 'Skill level', enum: SkillLevel })
  skillLevel!: SkillLevel;

  @Field(() => CostCalculation)
  @ApiProperty({ description: 'Cost calculation method', enum: CostCalculation })
  costCalculation!: CostCalculation;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Markup percentage', required: false })
  markup?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Fixed price', required: false })
  fixedPrice?: number;
}

@ObjectType('AssemblyComponent')
export class AssemblyComponentType {
  @Field(() => ID)
  @ApiProperty({ description: 'Component ID' })
  componentId!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Product ID' })
  productId!: string;

  @Field()
  @ApiProperty({ description: 'SKU' })
  sku!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Required quantity' })
  requiredQuantity!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Allocated quantity' })
  allocatedQuantity!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Consumed quantity' })
  consumedQuantity!: number;

  @Field(() => ComponentStatus)
  @ApiProperty({ description: 'Component status', enum: ComponentStatus })
  status!: ComponentStatus;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Shortage quantity', required: false })
  shortageQuantity?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Lot numbers', type: [String], required: false })
  lotNumbers?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Bin locations', type: [String], required: false })
  binLocations?: string[];
}

@ObjectType('AssemblyWorkOrder')
export class AssemblyWorkOrderType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Work order ID' })
  workOrderId!: string;

  @Field()
  @ApiProperty({ description: 'Work order number' })
  workOrderNumber!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Kit ID' })
  kitId!: string;

  @Field()
  @ApiProperty({ description: 'Kit SKU' })
  kitSku!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Quantity to assemble' })
  quantityToAssemble!: number;

  @Field(() => WorkOrderStatus)
  @ApiProperty({ description: 'Status', enum: WorkOrderStatus })
  status!: WorkOrderStatus;

  @Field(() => WorkOrderPriority)
  @ApiProperty({ description: 'Priority', enum: WorkOrderPriority })
  priority!: WorkOrderPriority;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Scheduled date', required: false })
  scheduledDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Started date', required: false })
  startedDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Completed date', required: false })
  completedDate?: Date;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Assigned to user ID', required: false })
  assignedTo?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Warehouse ID' })
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Work station ID', required: false })
  workStationId?: string;

  @Field(() => [AssemblyComponentType])
  @ApiProperty({ description: 'Components', type: [AssemblyComponentType] })
  components!: AssemblyComponentType[];

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Actual assembly time in minutes', required: false })
  actualAssemblyTime?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Created by user ID' })
  createdBy!: string;
}

// Input Types
@InputType()
export class KitComponentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

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
  @IsBoolean()
  isOptional?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSubstitutable?: boolean;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  substitutes?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

@InputType()
export class CreateKitInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  kitSku!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  kitName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => KitType)
  @IsEnum(KitType)
  kitType!: KitType;

  @Field(() => [KitComponentInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitComponentInput)
  components!: KitComponentInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  assemblyInstructions?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  assemblyTime?: number;

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @Field(() => CostCalculation)
  @IsEnum(CostCalculation)
  costCalculation!: CostCalculation;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  markup?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;
}

@InputType()
export class UpdateKitInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  kitName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => [KitComponentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitComponentInput)
  components?: KitComponentInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  assemblyInstructions?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  assemblyTime?: number;

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @Field(() => CostCalculation, { nullable: true })
  @IsOptional()
  @IsEnum(CostCalculation)
  costCalculation?: CostCalculation;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  markup?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;
}

@InputType()
export class CreateAssemblyWorkOrderInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  kitId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantityToAssemble!: number;

  @Field(() => WorkOrderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @Field({ nullable: true })
  @IsOptional()
  scheduledDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  workStationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType()
export class UpdateAssemblyWorkOrderInput {
  @Field(() => WorkOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @Field(() => WorkOrderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @Field({ nullable: true })
  @IsOptional()
  scheduledDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  workStationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

// Connection Types
@ObjectType()
export class KitDefinitionEdge extends Edge<KitDefinitionType> {
  @Field(() => KitDefinitionType)
  node!: KitDefinitionType;
}

@ObjectType()
export class KitDefinitionConnection extends Connection<KitDefinitionType> {
  @Field(() => [KitDefinitionEdge])
  edges!: KitDefinitionEdge[];
}

@ObjectType()
export class AssemblyWorkOrderEdge extends Edge<AssemblyWorkOrderType> {
  @Field(() => AssemblyWorkOrderType)
  node!: AssemblyWorkOrderType;
}

@ObjectType()
export class AssemblyWorkOrderConnection extends Connection<AssemblyWorkOrderType> {
  @Field(() => [AssemblyWorkOrderEdge])
  edges!: AssemblyWorkOrderEdge[];
}
