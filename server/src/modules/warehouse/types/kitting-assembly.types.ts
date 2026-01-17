import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, IsDate, Min, Max, Length, IsNotEmpty, IsObject } from 'class-validator';

// Enums
export enum KitType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  CONFIGURABLE = 'configurable',
}

export enum AssemblyWorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum AssemblyPriority {
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

export enum QualityCheckType {
  VISUAL = 'visual',
  MEASUREMENT = 'measurement',
  FUNCTIONAL = 'functional',
  SAFETY = 'safety',
}

export enum QualityResult {
  PASS = 'pass',
  FAIL = 'fail',
  NA = 'na',
}

export enum CostCalculationType {
  SUM_OF_PARTS = 'sum_of_parts',
  FIXED_PRICE = 'fixed_price',
  MARKUP_PERCENTAGE = 'markup_percentage',
}

export enum SkillLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

registerEnumType(KitType, { name: 'KitType' });
registerEnumType(AssemblyWorkOrderStatus, { name: 'AssemblyWorkOrderStatus' });
registerEnumType(AssemblyPriority, { name: 'AssemblyPriority' });
registerEnumType(ComponentStatus, { name: 'ComponentStatus' });
registerEnumType(QualityCheckType, { name: 'QualityCheckType' });
registerEnumType(QualityResult, { name: 'QualityResult' });
registerEnumType(CostCalculationType, { name: 'CostCalculationType' });
registerEnumType(SkillLevel, { name: 'SkillLevel' });

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

  @Field(() => Float)
  @ApiProperty({ description: 'Quantity required' })
  quantity!: number;

  @Field()
  @ApiProperty({ description: 'Unit of measure' })
  unitOfMeasure!: string;

  @Field()
  @ApiProperty({ description: 'Is optional component' })
  isOptional!: boolean;

  @Field()
  @ApiProperty({ description: 'Is substitutable' })
  isSubstitutable!: boolean;

  @Field(() => [ID], { nullable: true })
  @ApiProperty({ description: 'Substitute product IDs', type: [String], required: false })
  substitutes?: string[];

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Assembly position', required: false })
  position?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Component notes', required: false })
  notes?: string;
}

@ObjectType('QualityCheck')
export class QualityCheckType {
  @Field(() => ID)
  @ApiProperty({ description: 'Check ID' })
  checkId!: string;

  @Field()
  @ApiProperty({ description: 'Check name' })
  checkName!: string;

  @Field(() => QualityCheckType)
  @ApiProperty({ description: 'Check type', enum: QualityCheckType })
  checkType!: QualityCheckType;

  @Field()
  @ApiProperty({ description: 'Description' })
  description!: string;

  @Field()
  @ApiProperty({ description: 'Is required check' })
  isRequired!: boolean;

  @Field()
  @ApiProperty({ description: 'Acceptance criteria' })
  acceptanceCriteria!: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Required tools', type: [String], required: false })
  tools?: string[];
}

@ObjectType('PackagingInfo')
export class PackagingInfoType {
  @Field()
  @ApiProperty({ description: 'Package type' })
  packageType!: string;

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
  @ApiProperty({ description: 'Weight', required: false })
  weight?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Material', required: false })
  material?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Special instructions', required: false })
  specialInstructions?: string;
}

@ObjectType('KitDefinition')
export class KitDefinitionType extends BaseEntity {
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
  @ApiProperty({ description: 'Kit components', type: [KitComponentType] })
  components!: KitComponentType[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Assembly instructions', required: false })
  assemblyInstructions?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Assembly time in minutes', required: false })
  assemblyTime?: number;

  @Field(() => SkillLevel)
  @ApiProperty({ description: 'Required skill level', enum: SkillLevel })
  skillLevel!: SkillLevel;

  @Field(() => [QualityCheckType], { nullable: true })
  @ApiProperty({ description: 'Quality checks', type: [QualityCheckType], required: false })
  qualityChecks?: QualityCheckType[];

  @Field(() => PackagingInfoType, { nullable: true })
  @ApiProperty({ description: 'Packaging information', required: false })
  packaging?: PackagingInfoType;

  @Field(() => CostCalculationType)
  @ApiProperty({ description: 'Cost calculation method', enum: CostCalculationType })
  costCalculation!: CostCalculationType;

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

  @Field(() => Float)
  @ApiProperty({ description: 'Required quantity' })
  requiredQuantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Allocated quantity' })
  allocatedQuantity!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Consumed quantity' })
  consumedQuantity!: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Lot numbers', type: [String], required: false })
  lotNumbers?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Bin locations', type: [String], required: false })
  binLocations?: string[];

  @Field(() => ComponentStatus)
  @ApiProperty({ description: 'Component status', enum: ComponentStatus })
  status!: ComponentStatus;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Shortage quantity', required: false })
  shortageQuantity?: number;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ description: 'Substituted with product ID', required: false })
  substitutedWith?: string;
}

@ObjectType('QualityResultType')
export class QualityResultType {
  @Field(() => ID)
  @ApiProperty({ description: 'Check ID' })
  checkId!: string;

  @Field()
  @ApiProperty({ description: 'Check name' })
  checkName!: string;

  @Field(() => QualityResult)
  @ApiProperty({ description: 'Result', enum: QualityResult })
  result!: QualityResult;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Notes', required: false })
  notes?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Measured value', required: false })
  measuredValue?: number;

  @Field(() => ID)
  @ApiProperty({ description: 'Checked by user ID' })
  checkedBy!: string;

  @Field()
  @ApiProperty({ description: 'Checked at timestamp' })
  checkedAt!: Date;
}

@ObjectType('AssemblyWorkOrder')
export class AssemblyWorkOrderType extends BaseEntity {
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

  @Field(() => AssemblyWorkOrderStatus)
  @ApiProperty({ description: 'Status', enum: AssemblyWorkOrderStatus })
  status!: AssemblyWorkOrderStatus;

  @Field(() => AssemblyPriority)
  @ApiProperty({ description: 'Priority', enum: AssemblyPriority })
  priority!: AssemblyPriority;

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
  @ApiProperty({ description: 'Assembly components', type: [AssemblyComponentType] })
  components!: AssemblyComponentType[];

  @Field(() => [QualityResultType], { nullable: true })
  @ApiProperty({ description: 'Quality results', type: [QualityResultType], required: false })
  qualityResults?: QualityResultType[];

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Actual assembly time in minutes', required: false })
  actualAssemblyTime?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Work order notes', required: false })
  notes?: string;
}

@ObjectType('AssemblyMetrics')
export class AssemblyMetricsType {
  @Field(() => ID)
  @ApiProperty({ description: 'Kit ID' })
  kitId!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Average assembly time' })
  averageAssemblyTime!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Quality pass rate' })
  qualityPassRate!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total assemblies completed' })
  totalAssembliesCompleted!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Component shortage rate' })
  componentShortageRate!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'On-time completion rate' })
  onTimeCompletionRate!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Cost per assembly' })
  costPerAssembly!: number;
}

// Input Types
@InputType()
export class KitComponentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  sku!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

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
  @IsBoolean()
  isOptional?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSubstitutable?: boolean;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  substitutes?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  position?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

@InputType()
export class QualityCheckInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  checkName!: string;

  @Field(() => QualityCheckType)
  @IsEnum(QualityCheckType)
  checkType!: QualityCheckType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description!: string;

  @Field()
  @IsBoolean()
  isRequired!: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  acceptanceCriteria!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];
}

@InputType()
export class PackagingInfoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  packageType!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  material?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  specialInstructions?: string;
}

@InputType()
export class CreateKitDefinitionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
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
  @IsNotEmpty()
  components!: KitComponentInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  assemblyInstructions?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  assemblyTime?: number;

  @Field(() => SkillLevel)
  @IsEnum(SkillLevel)
  skillLevel!: SkillLevel;

  @Field(() => [QualityCheckInput], { nullable: true })
  @IsOptional()
  @IsArray()
  qualityChecks?: QualityCheckInput[];

  @Field(() => PackagingInfoInput, { nullable: true })
  @IsOptional()
  packaging?: PackagingInfoInput;

  @Field(() => CostCalculationType)
  @IsEnum(CostCalculationType)
  costCalculation!: CostCalculationType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  markup?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;
}

@InputType()
export class CreateAssemblyWorkOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  workOrderNumber!: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  kitId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantityToAssemble!: number;

  @Field(() => AssemblyPriority, { nullable: true })
  @IsOptional()
  @IsEnum(AssemblyPriority)
  priority?: AssemblyPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
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
  @Field(() => AssemblyWorkOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssemblyWorkOrderStatus)
  status?: AssemblyWorkOrderStatus;

  @Field(() => AssemblyPriority, { nullable: true })
  @IsOptional()
  @IsEnum(AssemblyPriority)
  priority?: AssemblyPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
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

@InputType()
export class RecordQualityCheckInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  checkId!: string;

  @Field(() => QualityResult)
  @IsEnum(QualityResult)
  result!: QualityResult;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  measuredValue?: number;
}

@InputType()
export class AllocateComponentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  componentId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lotNumbers?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  binLocations?: string[];
}

@InputType()
export class KitDefinitionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => KitType, { nullable: true })
  @IsOptional()
  @IsEnum(KitType)
  kitType?: KitType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;
}

@InputType()
export class AssemblyWorkOrderFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  kitId?: string;

  @Field(() => AssemblyWorkOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssemblyWorkOrderStatus)
  status?: AssemblyWorkOrderStatus;

  @Field(() => AssemblyPriority, { nullable: true })
  @IsOptional()
  @IsEnum(AssemblyPriority)
  priority?: AssemblyPriority;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
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